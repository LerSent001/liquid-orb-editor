import { createOrbUniformSnapshot } from "./orb-uniforms";
import { type OrbParams } from "./presets";
import { orbShaderSource } from "./shader-source";
import orbMetalSource from "../effect.metal?raw";

function formatSwiftFloats(values: number[]): string {
  const rows: string[] = [];
  for (let index = 0; index < values.length; index += 8) {
    rows.push(`    ${values.slice(index, index + 8).join(", ")},`);
  }
  return rows.join("\n");
}

export function createWebExport(params: OrbParams): string {
  const uniformSeed = createOrbUniformSnapshot(params);
  const shaderLiteral = JSON.stringify(orbShaderSource);

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Liquid Orb</title>
  <style>
    html, body, canvas { width: 100%; height: 100%; margin: 0; }
    body { overflow: hidden; background: ${params.canvasColor}; }
    canvas { display: block; }
    #status { position: fixed; inset: 0; display: grid; place-items: center; color: white; font: 14px system-ui; }
  </style>
</head>
<body>
  <canvas id="orb" aria-label="动态液态玻璃球"></canvas>
  <div id="status" hidden></div>
  <script type="module">
    const shaderSource = ${shaderLiteral};
    const uniformSeed = ${JSON.stringify(uniformSeed)};
    const canvas = document.querySelector("#orb");
    const status = document.querySelector("#status");

    async function start() {
      if (!navigator.gpu) throw new Error("当前环境不支持 WebGPU");
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) throw new Error("未找到可用的 WebGPU 适配器");
      const device = await adapter.requestDevice();
      const context = canvas.getContext("webgpu");
      if (!context) throw new Error("无法创建 WebGPU 画布上下文");

      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "premultiplied" });
      const shader = device.createShaderModule({ code: shaderSource });
      const compilation = await shader.getCompilationInfo();
      const errors = compilation.messages.filter((message) => message.type === "error");
      if (errors.length) {
        throw new Error(errors.map((message) => \`${"${message.lineNum}:${message.linePos} ${message.message}"}\`).join("\\n"));
      }

      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: shader, entryPoint: "vs_main" },
        fragment: { module: shader, entryPoint: "fs_main", targets: [{ format }] },
        primitive: { topology: "triangle-list" },
      });
      const values = new Float32Array(uniformSeed);
      const uniformBuffer = device.createBuffer({
        size: values.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      });
      const startedAt = performance.now();

      function frame(now) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        values[0] = width;
        values[1] = height;
        values[2] = (now - startedAt) / 1000;
        device.queue.writeBuffer(uniformBuffer, 0, values);

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store",
          }],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

    start().catch((error) => {
      status.hidden = false;
      status.textContent = error instanceof Error ? error.message : String(error);
      console.error(error);
    });
  </script>
</body>
</html>`;
}

export function createSwiftExport(params: OrbParams): string {
  const uniformSeed = createOrbUniformSnapshot(params);

  return `import MetalKit
import QuartzCore
import SwiftUI

private let orbMetalSource = #"""
${orbMetalSource}
"""#

private let orbUniformSeed: [Float] = [
${formatSwiftFloats(uniformSeed)}
]

private enum LiquidOrbError: Error {
    case metalUnavailable
    case shaderFunctionMissing(String)
    case commandQueueUnavailable
}

private final class LiquidOrbRenderer: NSObject, MTKViewDelegate {
    private let commandQueue: MTLCommandQueue
    private let pipeline: MTLRenderPipelineState
    private let startedAt = CACurrentMediaTime()
    private var uniforms = orbUniformSeed

    init(view: MTKView) throws {
        guard let device = MTLCreateSystemDefaultDevice() else {
            throw LiquidOrbError.metalUnavailable
        }
        view.device = device
        view.colorPixelFormat = .bgra8Unorm
        view.framebufferOnly = true
        view.preferredFramesPerSecond = 60
        view.enableSetNeedsDisplay = false
        view.isPaused = false
        view.clearColor = MTLClearColor(
            red: Double(uniforms[64]),
            green: Double(uniforms[65]),
            blue: Double(uniforms[66]),
            alpha: 1
        )

        let library = try device.makeLibrary(source: orbMetalSource, options: nil)
        guard let vertex = library.makeFunction(name: "vs_main") else {
            throw LiquidOrbError.shaderFunctionMissing("vs_main")
        }
        guard let fragment = library.makeFunction(name: "fs_main") else {
            throw LiquidOrbError.shaderFunctionMissing("fs_main")
        }
        let descriptor = MTLRenderPipelineDescriptor()
        descriptor.vertexFunction = vertex
        descriptor.fragmentFunction = fragment
        descriptor.colorAttachments[0].pixelFormat = view.colorPixelFormat
        descriptor.colorAttachments[0].isBlendingEnabled = true
        descriptor.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        descriptor.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        descriptor.colorAttachments[0].sourceAlphaBlendFactor = .one
        descriptor.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha
        pipeline = try device.makeRenderPipelineState(descriptor: descriptor)
        guard let queue = device.makeCommandQueue() else {
            throw LiquidOrbError.commandQueueUnavailable
        }
        commandQueue = queue
        super.init()
    }

    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

    func draw(in view: MTKView) {
        guard
            view.drawableSize.width > 0,
            view.drawableSize.height > 0,
            let descriptor = view.currentRenderPassDescriptor,
            let drawable = view.currentDrawable,
            let commandBuffer = commandQueue.makeCommandBuffer(),
            let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: descriptor)
        else { return }

        uniforms[0] = Float(view.drawableSize.width)
        uniforms[1] = Float(view.drawableSize.height)
        uniforms[2] = Float(CACurrentMediaTime() - startedAt)
        encoder.setRenderPipelineState(pipeline)
        uniforms.withUnsafeBytes { bytes in
            encoder.setFragmentBytes(bytes.baseAddress!, length: bytes.count, index: 0)
        }
        encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
        encoder.endEncoding()
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}

private final class LiquidOrbCoordinator {
    private var renderer: LiquidOrbRenderer?

    func makeView() -> MTKView {
        let view = MTKView(frame: .zero, device: nil)
        do {
            let renderer = try LiquidOrbRenderer(view: view)
            self.renderer = renderer
            view.delegate = renderer
            return view
        } catch {
            preconditionFailure("Liquid Orb Metal 初始化失败：\\(error)")
        }
    }
}

#if os(iOS)
private struct LiquidOrbSurface: UIViewRepresentable {
    func makeCoordinator() -> LiquidOrbCoordinator { LiquidOrbCoordinator() }
    func makeUIView(context: Context) -> MTKView { context.coordinator.makeView() }
    func updateUIView(_ view: MTKView, context: Context) {}
}
#elseif os(macOS)
private struct LiquidOrbSurface: NSViewRepresentable {
    func makeCoordinator() -> LiquidOrbCoordinator { LiquidOrbCoordinator() }
    func makeNSView(context: Context) -> MTKView { context.coordinator.makeView() }
    func updateNSView(_ view: MTKView, context: Context) {}
}
#endif

public struct LiquidOrbView: View {
    public init() {}

    public var body: some View {
        LiquidOrbSurface()
    }
}`;
}
