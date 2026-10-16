# WindowMap for macOS 🗺️

按全局快捷键（默认 `Option + Space`）秒级唤起轻量“窗口布局地图”，直观展示屏幕上所有应用窗口的相对空间位置与图标；点击或使用键盘方向键即可快速激活置顶目标窗口。

---

## 🌟 核心价值与特色

- **零录屏权限负担 (No Screen Recording Required)**：基于 macOS `CoreGraphics` 与 `Accessibility` 原生 API 构建，绝不捕获任何屏幕画面与像素，无隐私泄露风险，免除系统频繁的录屏授权弹窗。
- **空间记忆型切换**：比传统 `Cmd + Tab` 或 `AltTab` 的列表轮转更符合人类空间直觉（*“我记得 Chrome 在右上角、终端在左下角”*）。
- **极速唤起 (<200ms)**：基于 Tauri 2 + Rust 原生 CoreGraphics，常驻后台且不占 Dock 栏 (`LSUIElement = true`)，快捷键唤起零延迟。
- **阶梯错落层叠 (Cascading Stagger)**：针对全屏或同一位置多窗口叠放场景，采用阶梯错落露出顶栏与侧边，鼠标悬停即时置顶高亮，解决窗口被完全挡死无法点击的问题。
- **独立台前调度 (Stage Manager) 侧栏**：完美适配 macOS 台前调度，将侧边收纳的应用拆分为独立列表；显示应用名称与图标，鼠标悬浮弹出 Popover 查看完整信息与标题，点击即可直接拉起激活。
- **深色与浅色双模式 (Dark & Light Theme)**：支持深色、浅色及跟随系统主题，顶部一键切换，毛玻璃视觉与文字对比度自适应。
- **多屏与全屏沉浸支持**：自动探测当前鼠标所在的显示器；Overlay 浮层配置 `CanJoinAllSpaces` 与 `FullScreenAuxiliary`，即便在全屏 App 上层也能顺畅弹出。
- **双重导航模式**：同时支持鼠标点击与键盘方向键（`↑↓←→` / `Tab`）空间选框切换，按 `Enter` 立即激活置顶。

---

## 🛠️ 技术架构

```text
React 前端 (Zustand + Tailwind CSS + Lucide Icons)
├── WindowMapOverlay (核心面板，支持深浅主题、鼠标悬停、点击激活、键盘方向键切换)
├── WindowCard (等比尺寸映射、阶梯错落位移、App 图标与序号徽章、高亮聚焦轮廓)
├── StageManagerShelf (独立台前调度侧栏，应用名截断与悬浮 Popover 详情)
├── SettingsModal (快捷键录制、主题切换、锚点、尺寸实时滑动、激活后关闭配置等)
└── PermissionGuide (Accessibility 辅助功能权限状态与去授权引导)
       │
       ▼ Tauri IPC Command
Rust Core (macOS Quartz & Cocoa 原生层)
├── macos::screen (CGDisplayBounds 获取 Quartz 统一坐标，检测鼠标当前屏幕)
├── macos::window (CGWindowListCopyWindowInfo 枚举当前活跃窗口并识别 Stage Manager)
├── macos::icon (NSRunningApplication.icon 提取为 PNG Base64，采用 BundleID/Name 内存缓存)
├── macos::activate (NSRunningApplication + AXUIElement 容差匹配执行 AXRaise 激活置顶)
├── macos::window_ext (动态重置窗口尺寸与锚点、跨 Space 与全屏置顶)
└── tray (系统菜单栏常驻托盘与右键菜单)
```

---

## ⌨️ 快捷键说明

| 按键 | 功能 |
|---|---|
| `Option + Space` (Alt+Space) | 全局呼出 / 隐藏 WindowMap 地图浮层 |
| `↑` `↓` `←` `→` | 空间方向选框移动（自动根据相对方位与距离算法选择邻近窗口） |
| `Enter` | 激活置顶当前选中的目标窗口 |
| `Tab` / `Shift + Tab` | 顺时针 / 逆时针循环切换窗口焦点 |
| `1` - `9` | 快速切换目标显示器 |
| `Esc` / 点击地图外空白处 | 立即退出并隐藏地图浮层 |

---

## ⚙️ 偏好设置

点击面板右上角的 ⚙️ 齿轮图标可进入设置：
- **外观主题风格**：深色模式、浅色模式、跟随系统。
- **全局快捷键**：支持点击捕获录制任意键盘快捷键（如 `Option + Space`、`Cmd + Shift + M` 等）。
- **面板尺寸比例**：支持 25% 到 85% 自由滑动，并支持实时动态缩放原生窗口大小。
- **浮层弹出锚点**：支持屏幕居中、左上角、右上角、左下角、右下角。
- **激活应用后关闭 WindowMap**：开启后点击激活自动收起；关闭后保持置顶以便连续切换。
- **台前调度侧栏应用**：可选择开启或收起台前调度独立抽屉栏。
- **显示窗口标题**：开启后可通过窗口真实标题区分相同浏览器的不同网页标签。
- **辅助功能权限**：查看授权状态并一键跳转系统设置授权。

---

## 🚀 本地开发与构建

### 运行环境要求
- macOS 12+ (Apple Silicon 或 Intel)
- Node.js 18+ 与 pnpm (`corepack enable pnpm` 或 `brew install pnpm`)
- Rust 与 Cargo (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- Tauri CLI (`cargo install tauri-cli --version "^2.0.0"`)

### 安装依赖
```bash
pnpm install
```

### 开发模式运行
```bash
pnpm tauri dev
```

### 生产打包构建
```bash
pnpm tauri build
```
构建产物（`.dmg` 与 `.app`）将生成在 `src-tauri/target/release/bundle/dmg/` 目录下。

---

## 📄 License
MIT License.
