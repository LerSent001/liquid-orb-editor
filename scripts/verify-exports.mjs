import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [{ createSwiftExport, createWebExport }, presets, uniforms, shaderModule] =
    await Promise.all([
      server.ssrLoadModule("/src/code-export.ts"),
      server.ssrLoadModule("/src/presets.ts"),
      server.ssrLoadModule("/src/orb-uniforms.ts"),
      server.ssrLoadModule("/src/shader-source.ts"),
    ]);
  const [wgsl, metal] = await Promise.all([
    readFile(new URL("../effect.wgsl", import.meta.url), "utf8"),
    readFile(new URL("../effect.metal", import.meta.url), "utf8"),
  ]);
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  const sceneScaleMatch = styles.match(
    /\.orb-stage\[data-preview-mode="scene"\] \.orb-canvas,[\s\S]*?transform:\s*scale\(([\d.]+)\);/,
  );
  assert.ok(sceneScaleMatch, "场景画布缩放配置缺失");
  const sceneScale = Number(sceneScaleMatch[1]);
  assert.ok(
    presets.orbRadiusRange.max * sceneScale <= 1,
    "场景画布会裁掉最大半径球体的边缘参数",
  );

  function extractOpticalWeights(source, patterns, backend) {
    return Object.fromEntries(
      Object.entries(patterns).map(([name, pattern]) => {
        const match = source.match(pattern);
        assert.ok(match, `${backend}: ${name} 光学权重缺失`);
        return [name, match.slice(1).map(Number)];
      }),
    );
  }

  const wgslOpticalWeights = extractOpticalWeights(
    wgsl,
    {
      inner: /opticalRim \* u\.glassOpacity \* ([\d.]+)/,
      dispersion: /\* \(([\d.]+) \+ ([\d.]+) \* u\.shellEdgeAlpha\)/,
      key: /clamp\(u\.sheen, 0\.0, 2\.0\) \* ([\d.]+);/,
      fill: /clamp\(u\.sheen, 0\.0, 2\.0\) \* ([\d.]+);\n\s*col = glsOver\(col, u\.sheenColor/,
    },
    "WGSL",
  );
  const metalOpticalWeights = extractOpticalWeights(
    metal,
    {
      inner: /\(opticalRim \* _e247\) \* ([\d.]+)\)/,
      dispersion: /\* \(([\d.]+) \+ \(([\d.]+) \* _e275\)\)/,
      key: /metal::clamp\(_e332, 0\.0, 2\.0\)\) \* ([\d.]+);/,
      fill: /metal::clamp\(_e345, 0\.0, 2\.0\)\) \* ([\d.]+);/,
    },
    "Metal",
  );
  assert.deepEqual(metalOpticalWeights, wgslOpticalWeights, "WebGPU 与 Metal 光学权重不一致");
  assert.ok(wgslOpticalWeights.inner[0] >= 0.1, "玻璃底色权重过低，颜色控件不可见");
  assert.ok(wgslOpticalWeights.dispersion[0] >= 0.1, "色散底色权重过低，颜色控件不可见");
  assert.ok(wgslOpticalWeights.key[0] >= 1, "主高光权重过低，颜色控件不可见");
  assert.ok(wgslOpticalWeights.fill[0] >= 0.8, "辅高光权重过低，颜色控件不可见");

  assert.ok(presets.styleNames.length > 0, "至少需要一个预设");
  assert.equal(
    new Set(presets.styleNames).size,
    presets.styleNames.length,
    "预设名称不能重复",
  );

  for (const style of presets.styleNames) {
    const params = { style, ...presets.stylePresets[style] };
    const expectedSeed = uniforms.createOrbUniformSnapshot(params);
    const webCode = createWebExport(params);
    const swiftCode = createSwiftExport(params);

    const webSeedMatch = webCode.match(/const uniformSeed = (\[[^;]+\]);/);
    const swiftSeedMatch = swiftCode.match(
      /private let orbUniformSeed: \[Float\] = \[([\s\S]*?)\]/,
    );
    assert.ok(webSeedMatch, `${style}: Web uniform seed 缺失`);
    assert.ok(swiftSeedMatch, `${style}: Swift uniform seed 缺失`);

    const webSeed = JSON.parse(webSeedMatch[1]);
    const swiftSeed = swiftSeedMatch[1]
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map(Number);
    assert.deepEqual(webSeed, expectedSeed, `${style}: Web 参数与编辑器不一致`);
    assert.deepEqual(swiftSeed, expectedSeed, `${style}: Swift 参数与编辑器不一致`);
    assert.equal(webSeed.length, 128, `${style}: uniform 长度错误`);
    assert.equal(webSeed[15], presets.styleFlowIndexes[style], `${style}: Web 分发索引错误`);
    assert.equal(swiftSeed[15], presets.styleFlowIndexes[style], `${style}: Swift 分发索引错误`);
    assert.equal(webSeed[19], 1, `${style}: Web 默认玻璃罩未开启`);
    assert.equal(swiftSeed[19], 1, `${style}: Swift 默认玻璃罩未开启`);

    if (style === "chromaticMetal") {
      const metalUniforms = [
        [22, "bandDensity", "重复次数"],
        [23, "chromaticShift", "RGB 分离"],
        [24, "metalScale", "图案缩放"],
        [25, "metalStretch", "纵横拉伸"],
        [26, "metalAngle", "流带角度"],
        [27, "metalOffset", "图案偏移"],
        [28, "metalPhase", "循环相位"],
        [29, "metalEvolution", "演化幅度"],
        [30, "metalRoughness", "表面粗糙度"],
        [31, "metalDepth", "金属深度"],
      ];
      for (const [index, key, label] of metalUniforms) {
        assert.ok(
          Math.abs(webSeed[index] - params[key]) < 0.000001,
          `色差金属：${label}未写入 uniform`,
        );
        assert.match(wgsl, new RegExp(`\\b${key}:\\s+f32`), `WGSL 缺少 ${label} 参数`);
        assert.match(metal, new RegExp(`float ${key};`), `Metal 缺少 ${label} 参数`);
      }
      assert.match(wgsl, /let cycle = t \* 0\.46 \+ u\.metalPhase/, "WGSL 动画未使用循环相位");
      assert.match(metal, /float cycle = t \* 0\.46 \+ u\.metalPhase/, "Metal 动画未使用循环相位");
      assert.match(wgsl, /\+ cycle\n\s+\+ u\.metalOffset/, "WGSL 主流场缺少单向相位推进");
      assert.match(metal, /\+ cycle\n\s+\+ u\.metalOffset/, "Metal 主流场缺少单向相位推进");
      const loopDuration = (Math.PI * 2) / (0.46 * params.speed);
      assert.ok(loopDuration >= 11.5 && loopDuration <= 13, "色差金属默认循环时长偏离参考视频");
      assert.match(swiftCode, /red: Double\(uniforms\[72\]\)/, "Swift 背景颜色索引未同步");
    }

    const webShaderMatch = webCode.match(/^    const shaderSource = (.+);$/m);
    assert.ok(webShaderMatch, `${style}: Web shader 源码缺失`);
    assert.equal(JSON.parse(webShaderMatch[1]), shaderModule.orbShaderSource);
    const webScriptMatch = webCode.match(/<script type="module">([\s\S]*?)<\/script>/);
    assert.ok(webScriptMatch, `${style}: Web 运行脚本缺失`);
    assert.doesNotThrow(() => new Function(webScriptMatch[1]), `${style}: Web 运行脚本语法错误`);

    const swiftMetalMatch = swiftCode.match(
      /private let orbMetalSource = #"""\n([\s\S]*?)\n"""#/,
    );
    assert.ok(swiftMetalMatch, `${style}: Swift Metal 源码缺失`);
    assert.equal(swiftMetalMatch[1], metal, `${style}: Swift Metal 源码失真`);

    const flowIndex = presets.styleFlowIndexes[style];
    assert.match(wgsl, new RegExp(`style == ${flowIndex}\\b`), `${style}: WGSL 分支缺失`);
    assert.match(metal, new RegExp(`style == ${flowIndex}\\b`), `${style}: Metal 分支缺失`);
    assert.match(webCode, /device\.lost\.then/, `${style}: Web 设备丢失处理缺失`);
    assert.match(webCode, /uncapturederror/, `${style}: Web GPU 错误处理缺失`);
  }

  const adjustedMetal = {
    style: "chromaticMetal",
    ...presets.stylePresets.chromaticMetal,
    speed: 1.17,
    bandDensity: 4.3,
    chromaticShift: 0.68,
    metalScale: 1.31,
    metalStretch: 0.74,
    metalAngle: -38,
    metalOffset: -0.27,
    metalPhase: 0.63,
    metalEvolution: 1.46,
    metalRoughness: 0.57,
    metalDepth: 0.81,
    colorA: "#DDE8E4",
  };
  const adjustedExpected = uniforms.createOrbUniformSnapshot(adjustedMetal);
  const adjustedWeb = createWebExport(adjustedMetal);
  const adjustedSwift = createSwiftExport(adjustedMetal);
  const adjustedWebMatch = adjustedWeb.match(/const uniformSeed = (\[[^;]+\]);/);
  const adjustedSwiftMatch = adjustedSwift.match(
    /private let orbUniformSeed: \[Float\] = \[([\s\S]*?)\]/,
  );
  assert.ok(adjustedWebMatch, "调参后的 Web uniform seed 缺失");
  assert.ok(adjustedSwiftMatch, "调参后的 Swift uniform seed 缺失");
  const adjustedWebSeed = JSON.parse(adjustedWebMatch[1]);
  const adjustedSwiftSeed = adjustedSwiftMatch[1]
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
  assert.deepEqual(adjustedWebSeed, adjustedExpected, "调参后的 Web 导出与编辑器不一致");
  assert.deepEqual(adjustedSwiftSeed, adjustedExpected, "调参后的 Swift 导出与编辑器不一致");

  console.log(
    `Verified ${presets.styleNames.length} presets: editor, WebGPU, and SwiftUI parameters are identical.`,
  );
} finally {
  await server.close();
}
