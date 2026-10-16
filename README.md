# WindowMap for macOS 🗺️

按全局快捷键（默认 `Option + Space`）秒级唤起轻量“窗口布局地图”，优雅展示屏幕上所有应用窗口，支持类似 **React Bits BounceCards** 的规范同比例弹性卡片流与避让动效；点击或使用键盘方向键即可快速激活置顶目标窗口。

---

## 🌟 核心价值与特色

- **零录屏权限负担 (No Screen Recording Required)**：基于 macOS `CoreGraphics` 与 `Accessibility` 原生 API 构建，绝不捕获任何屏幕画面与像素，无隐私泄露风险，免除系统频繁的录屏授权弹窗。
- **BounceCards 规范化同比例弹性卡片**：彻底摒弃传统绝对几何缩放导致的“大窗口盖死小窗口”和“缩放后窗口太窄太扁放不下文字”的痛点；所有应用规范为黄金比例同尺寸卡片，清晰展现高清大图标、应用名、窗口具体标签标题与序号徽章。
- **BounceCards 灵动避让交互 (Push Apart on Hover)**：
  - 卡片呈自然微角度扇形与阵列排列；
  - 鼠标悬停任意卡片时，卡片自动直立摆正、浮起放大并强发光置顶；
  - 同组其他卡片向两侧平滑弹开避让（Push Distance），鼠标移开顺滑回弹，手感惊艳。
- **纯净台前调度 (AnimatedList 动效流)**：
  - 彻底过滤 `WindowManager` 等无界面的系统后台图层窗口；
  - 采用类似 React Bits AnimatedList 的流畅选择胶囊光标（Gliding Pill）与上下边缘羽化遮罩（Fade Mask），并支持悬浮 Popover 详细预览。
- **窗口顶部原生拖拽**：鼠标按住顶部标题栏任意空白区域即可在屏幕上随心移动面板位置。
- **深色与浅色双模式 (Dark & Light Theme)**：支持深色、浅色及跟随系统主题，顶部一键切换，毛玻璃视觉与文字对比度自适应。
- **多屏快速切换**：自动探测当前鼠标所在的显示器；支持顶部选项卡点击与数字键 `1`-`9` 秒级切屏。
- **双重导航模式**：同时支持鼠标点击与键盘方向键（`↑↓←→` / `Tab`）无缝切换与弹动聚焦，按 `Enter` 立即激活置顶。

---

## 🛠️ 技术架构

```text
React 前端 (Zustand + Tailwind CSS + Lucide Icons)
├── WindowMapOverlay (主容器面板，顶部原生拖拽、深浅切换、多屏 Tab、键盘总线)
├── WindowBounceDeck (BounceCards 同比例卡片扇形/网格弹性容器，两侧推开物理引擎)
├── WindowCard (统一黄金比例卡片，高清图标、应用名、窗口标题、专属主题色)
├── StageManagerShelf (AnimatedList 动效侧栏，滑动跟随胶囊与悬浮 Popover 详情)
├── SettingsModal (快捷键录制、主题切换、锚点、尺寸实时滑动、激活后关闭配置等)
└── PermissionGuide (Accessibility 辅助功能权限状态与去授权引导)
       │
       ▼ Tauri IPC Command
Rust Core (macOS Quartz & Cocoa 原生层)
├── macos::screen (CGDisplayBounds 获取 Quartz 统一坐标，检测鼠标当前屏幕)
├── macos::window (CGWindowListCopyWindowInfo 枚举当前活跃窗口并识别 Stage Manager，过滤系统图层)
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
| `↑` `↓` `←` `→` | 在 BounceCards 卡片流中平滑切换焦点，联动卡片弹跳置顶与推开 |
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

### 安装依赖与构建
```bash
pnpm install
pnpm tauri dev   # 开发模式
pnpm tauri build # 生产打包
```
构建产物（`.dmg` 与 `.app`）将生成在 `src-tauri/target/release/bundle/dmg/` 目录下。

---

## 📄 License
MIT License.
