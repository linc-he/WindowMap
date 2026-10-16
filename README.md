# WindowMap for macOS 🗺️

按全局快捷键（默认 `Option + Space`）秒级唤起轻量“窗口布局地图”，直观展示屏幕上所有应用窗口的相对空间位置与图标；点击或使用键盘方向键即可快速激活置顶目标窗口并自动隐藏地图。

---

## 🌟 核心价值与特色

- **零录屏权限负担 (No Screen Recording Required)**：基于 macOS `CoreGraphics` 与 `Accessibility` 原生 API 构建，绝不捕获任何屏幕画面与像素，无隐私泄露风险，免除系统频繁的录屏授权弹窗。
- **空间记忆型切换**：比传统 `Cmd + Tab` 或 `AltTab` 的列表轮转更符合人类空间直觉（*“我记得 Chrome 在右上角、终端在左下角”*）。
- **极速唤起 (<200ms)**：基于 Tauri 2 + Rust 原生 CoreGraphics，常驻后台且不占 Dock 栏 (`LSUIElement = true`)，快捷键唤起零延迟。
- **多屏与全屏沉浸支持**：自动探测当前鼠标所在的显示器；Overlay 浮层配置 `CanJoinAllSpaces` 与 `FullScreenAuxiliary`，即便在全屏 App 上层也能顺畅弹出。
- **双重导航模式**：同时支持鼠标点击与键盘方向键（`↑↓←→` / `Tab`）空间选框切换，按 `Enter` 立即激活置顶。

---

## 🛠️ 技术架构

```text
React 前端 (Zustand + Tailwind CSS + Lucide Icons)
├── WindowMapOverlay (全屏/面板等比网格，支持鼠标悬停、点击激活、键盘方向键切换)
├── WindowCard (等比尺寸映射、App 图标与序号徽章、高亮聚焦轮廓)
├── SettingsModal (快捷键、锚点位置、尺寸比例、多屏模式、标题显示设置)
└── PermissionGuide (Accessibility 辅助功能权限状态与去授权引导)
       │
       ▼ Tauri IPC Command
Rust Core (macOS Quartz & Cocoa 原生层)
├── macos::screen (CGDisplayBounds 获取 Quartz 统一坐标，检测鼠标当前屏幕)
├── macos::window (CGWindowListCopyWindowInfo 枚举当前活跃窗口并自动过滤系统背景)
├── macos::icon (NSRunningApplication.icon 提取为 PNG Base64，采用 BundleID/Name 内存缓存)
├── macos::activate (NSRunningApplication + AXUIElement 容差匹配执行 AXRaise 激活置顶)
├── macos::window_ext (NSWindowCollectionBehavior 跨所有 Space，NSStatusWindowLevel 最高置顶)
└── tray (系统菜单栏常驻托盘与右键菜单)
```

---

## ⌨️ 快捷键说明

| 按键 | 功能 |
|---|---|
| `Option + Space` (Alt+Space) | 全局呼出 / 隐藏 WindowMap 地图浮层 |
| `↑` `↓` `←` `→` | 空间方向选框移动（自动根据相对方位与距离算法选择邻近窗口） |
| `Enter` | 激活置顶当前选中的目标窗口，并关闭地图浮层 |
| `Tab` / `Shift + Tab` | 顺时针 / 逆时针循环切换窗口焦点 |
| `Esc` / 点击地图外空白处 | 立即退出并隐藏地图浮层 |

---

## ⚙️ 偏好设置

点击面板右上角的 ⚙️ 齿轮图标可进入设置：
- **全局快捷键**：自定义修改唤起按键组合。
- **浮层弹出锚点**：支持左上角、右上角、屏幕居中、左下角、右下角。
- **面板尺寸比例**：在 15% 到 45% 之间等比自适应当前屏幕。
- **多显示器范围**：支持“仅当前鼠标所在屏幕”与“所有活跃显示器”。
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
