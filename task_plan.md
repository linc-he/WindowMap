# WindowMap 开发计划：概览模式与自由拖拽多屏网格 (task_plan.md)

## 需求背景与设计目标
用户提出新增“概览模式”，并满足以下核心设计：
1. **默认进入概览模式**：呼出 WindowMap 时默认处于概览模式，同时支持在顶部导航灵活切换单屏聚焦与概览模式。
2. **多屏幕大卡片（Screen Grid Containers）**：
   - 画面中同时呈现所有连接的显示器大卡片；
   - **非固定位置**：鼠标按住大卡片顶部标头（Titlebar/Header），可以自由拖拽放置在画布中任意位置布局；
   - 记忆用户拖拽布局（持久化存储到 localStorage），并提供“一键重置排版”功能；
   - 大卡片顶部带有抓手手柄、屏幕编号与主屏标识、分辨率及应用计数，支持点击一键“聚焦单屏”。
3. **应用小卡片与 CardSwap 3D 效果**：
   - 每个屏幕大卡片内部容纳该屏幕的各应用小卡片；
   - 小卡片尺寸比单屏卡片更为精致小巧（188px × 118px），保留高清大图标、应用名、窗口标题与特征彩条；
   - 融入经典的 **React Bits CardSwap** 效果：3D 透视倾斜、立体深度阶梯叠放、悬浮微展与聚焦弹跳；
   - 点击应用卡片无缝激活置顶目标窗口并关闭浮层（与现有交互完全对齐）。
4. **全屏幕台前调度侧栏（统一右侧展示，屏幕间清晰区分）**：
   - 概览模式下，右侧台前调度侧栏聚合**所有屏幕**的台前调度收纳应用；
   - 按屏幕清晰分组（如【屏幕 1 (主屏)】、【屏幕 2】），每组带有专属标识徽章、计数与独立分隔线，一目了然；
   - 单击任意收纳项直接唤起目标窗口，悬浮查看详情 Popover。

---

## 阶段六实施任务清单

- [x] **任务 1：升级 Store 状态支持概览模式与全屏窗口管理** `complete`
  - [x] 在 `src/types/index.ts` 中补充视图模式定义（`viewMode: 'overview' | 'single'`）及大卡片坐标接口；
  - [x] 在 `src/store/useStore.ts` 中新增 `viewMode`（默认 `'overview'`）、`setViewMode` 方法；
  - [x] 导出按屏幕划分的普通窗口和台前调度窗口的数据获取方法。

- [x] **任务 2：实现 React Bits 风格 CardSwap 小卡片组件** `complete`
  - [x] 创建 `src/components/CardSwapDeck.tsx`：实现 3D 堆叠深度（`translate3d`、`rotate`、`skewY`）、悬浮微展开（`hoverSpread`）与弹跳动画；
  - [x] 支持单应用居中、多应用 3D 堆叠翻转；
  - [x] 卡片尺寸自适应缩小排版，点击任意小卡片立即触发 `activateWindow(win)`。

- [x] **任务 3：实现可自由拖拽布局的屏幕大卡片容器（ScreenGridCard / OverviewCanvas）** `complete`
  - [x] 创建 `src/components/ScreenGridCard.tsx`：
    - 顶部拖拽手柄区域，按住鼠标可流畅平移卡片坐标；
    - 防止拖拽事件冒泡导致 Tauri 窗口被触发；
    - 屏幕信息展示、计数徽章、聚焦单屏快捷按钮；
    - 容器内部嵌入 `CardSwapDeck`；
  - [x] 创建 `src/components/OverviewCanvas.tsx`：管理各屏幕坐标状态、持久化存储与自适应初始排列。

- [x] **任务 4：重构台前调度侧栏（StageManagerShelf）支持多屏幕清晰区分** `complete`
  - [x] 改造 `src/components/StageManagerShelf.tsx`，支持概览模式下分组展示所有屏幕的台前调度应用；
  - [x] 添加明显的屏幕分组标头、色彩徽章与分隔线；
  - [x] 保留平滑激活与 Popover 悬浮浮窗。

- [x] **任务 5：重构主界面（WindowMapOverlay）与顶部导航** `complete`
  - [x] 默认展示概览模式，顶部 Tab 提供【🌐 概览模式】和各屏幕切换（快捷键 0 概览，1-9 切换单屏）；
  - [x] 键盘快捷键适配概览模式与单屏模式；
  - [x] 提供“重置布局”快捷操作。

- [x] **任务 6：构建、打包、覆盖安装与 GitHub 提交** `complete`
  - [x] 运行 `pnpm build` 与 `pnpm tauri build`；
  - [x] 覆盖安装至 `/Applications/WindowMap.app` 并重启验证；
  - [x] 提交代码至 GitHub `main` 分支。
