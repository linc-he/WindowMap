# WindowMap 任务计划与进度跟踪 (task_plan.md)

## 项目目标
开发 **WindowMap for macOS**：一款按快捷键（默认 `Option+Space`）唤起半透明轻量“窗口布局地图”的 macOS 原生级应用。
- 显示当前/所有屏幕上窗口真实相对位置、图标、应用名称；
- 支持点击或方向键选中，无缝激活目标窗口置顶并隐藏地图；
- 基于 Tauri 2 + React + TypeScript + Tailwind CSS + Rust + macOS CoreGraphics / Accessibility API 构建；
- 无需录屏权限（Screen Recording），毫秒级极速响应，菜单栏常驻。

---

## 开发阶段与状态

- [x] **阶段 1：项目脚手架与 Tauri 2 核心环境** `complete`
  - [x] 配置 Git 与远程仓库连接
  - [x] 初始化 Tauri 2 + React + TypeScript + Tailwind CSS + Lucide Icons + Zustand
  - [x] 配置 macOS `Info.plist`（`LSUIElement = true` 菜单栏常驻无 Dock）与窗口参数（无边框、透明、置顶、`skipTaskbar`）
  - [x] 集成 `tauri-plugin-global-shortcut` 注册默认快捷键（`Option+Space`）
  - [x] 验证快捷键呼出/隐藏透明 Overlay 浮层及 `Esc` 退出

- [x] **阶段 2：Rust 原生窗口枚举、图标提取与坐标转换** `complete`
  - [x] 编写 Rust 原生模块：获取屏幕物理与逻辑分辨率（Quartz 坐标系）
  - [x] 编写 Rust 模块：`CGWindowListCopyWindowInfo` 枚举 Visible 窗口并过滤系统背景与浮层
  - [x] 编写 Rust 模块：提取 App 图标为 Base64 / Data URL 并建立 BundleID 内存缓存
  - [x] 前端 React 接入 Rust IPC 命令 `list_windows` 与 `get_screens`
  - [x] 验证等比坐标映射，绘制窗口卡片、图标、应用名、聚焦高亮

- [x] **阶段 3：Accessibility 窗口激活与键盘交互闭环** `complete`
  - [x] 编写 Rust 模块：检测 Accessibility 权限（`AXIsProcessTrusted`）并支持一键打开系统设置
  - [x] 编写 Rust 模块：`activate_window`（NSRunningApplication 激活 + AXUIElement 容差匹配执行 AXRaise）
  - [x] 前端实现点击窗口卡片激活并收起地图
  - [x] 前端实现键盘方向键（Up/Down/Left/Right）空间选框切换与 `Enter` 激活，`Esc` 退出
  - [x] 增加权限未开启时的引导遮罩面板

- [x] **阶段 4：设置面板、系统托盘（Tray）与构建打包** `complete`
  - [x] 实现菜单栏 System Tray 图标与右键菜单（打开设置、检查权限、退出应用）
  - [x] 实现设置界面（快捷键录制、锚点选择、缩放比例、显示多屏开关、窗口标题开关）
  - [x] 使用本地配置持久化保存用户设置
  - [x] 优化过渡动画、空状态、异常拔插屏幕保护
  - [x] 构建打包验证（`pnpm build` 与 `cargo check` 通过）与 GitHub Actions CI 工作流编写

- [x] **阶段 5：本机生产编译与安装至 /Applications** `complete`
  - [x] 运行 `pnpm tauri build` 构建 macOS release 产物 (.app / .dmg)
  - [x] 将构建生成的 `WindowMap.app` 安装至 `/Applications/`
  - [x] 清除隔离属性（`xattr -cr /Applications/WindowMap.app`）确保系统顺利执行
  - [x] 启动应用并协助用户完成辅助功能权限授权验证

---

## 错误记录与决策表
| 问题/错误 | 尝试方案 | 最终解决方案 |
|---|---|---|
| CGWindowList 坐标系 vs NSScreen | 原方案误认为 CGWindow 是左下角原点 | 统一采用 Quartz 坐标系（左上角原点，Y向下），直接等比映射无需 Y 倒置 |
| 窗口标题读取权限 | 无录屏权限下 CGWindowName 为空 | 默认显示应用名，开启标题时通过 Accessibility AXTitle 属性获取 |
| tauri.conf.json infoPlist 格式 | 传入 inline map 报错 invalid type: map | 创建 `Info.plist` 并配置路径字符串 `"infoPlist": "Info.plist"` |
| 窗口激活与容差匹配 | macOS 无法 1:1 将 CGWindowID 映射至 AXWindow | 采用两阶段激活：NSRunningApplication 激活 App + AXUIElement 容差匹配 Bounds 执行 AXRaise |
