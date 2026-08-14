# Liquid Orb Editor

一个使用 React、WebGPU/WGSL 和 Toolcraft UI 构建的实时液态玻璃球编辑器。

在线使用：[https://lersent001.github.io/liquid-orb-editor/](https://lersent001.github.io/liquid-orb-editor/)

## 功能

- 8 个可编辑的动态球体预设
- 颜色、速度、形状、玻璃折射和外发光参数
- 球体预览与实际场景预览
- 参数通过 URL hash 保存，可直接分享当前效果
- 导出独立 Web 页面和 SwiftUI/Metal 代码
- Web 与 SwiftUI 导出使用同一份参数快照
- 场景模式和球体模式导出同一份球体动画代码

## 本地运行

需要 Node.js 22、pnpm 11，以及支持 WebGPU 的浏览器。

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm preview
```

## 代码结构

- `src/presets.ts`：预设和参数默认值
- `src/orb-uniforms.ts`：编辑器参数到 GPU uniform 的唯一映射
- `src/orb-renderer.ts`：WebGPU 渲染器
- `src/code-export.ts`：Web 与 SwiftUI 导出
- `effect.wgsl`：浏览器着色器
- `effect.metal`：SwiftUI 导出的 Metal 着色器

## 许可证

项目代码使用 [MIT License](LICENSE)。`src/toolcraft` 包含的 Toolcraft UI 代码保留其原始 MIT 版权声明，详见 [TOOLCRAFT_LICENSE.md](TOOLCRAFT_LICENSE.md)。
