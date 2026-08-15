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
    assert.equal(webSeed[15], presets.styleFlowIndexes[style], `${style}: Web 分发索引错误`);
    assert.equal(swiftSeed[15], presets.styleFlowIndexes[style], `${style}: Swift 分发索引错误`);
    assert.equal(webSeed[19], 1, `${style}: Web 默认玻璃罩未开启`);
    assert.equal(swiftSeed[19], 1, `${style}: Swift 默认玻璃罩未开启`);

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

  console.log(
    `Verified ${presets.styleNames.length} presets: editor, WebGPU, and SwiftUI parameters are identical.`,
  );
} finally {
  await server.close();
}
