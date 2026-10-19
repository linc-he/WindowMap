# WindowMap 开发方向重构计划：从真实位置映射转型为规范化 BounceCards 弹性卡片布局 (task_plan.md)

## 项目重大方向调整
摒弃原有的 macOS 真实物理坐标几何缩放映射，转为**基于屏幕的规范化同大小卡片流 + 原生级 BounceCards 弹性交互**：
1. **同比例同大小卡片（Uniform Proportional Cards）**：
   - 无论应用真实窗口是全屏、半屏还是小窗口，统一规范化为固定黄金比例卡片（244px × 152px）；
   - 卡片内容统一排版：高清应用大图标、大号应用名、窗口具体标题标签、序号徽章、专属主题色彩与顶部毛玻璃高亮饰条；
   - 彻底消灭“大窗口遮死小窗口”和“缩放后窗口太窄太扁放不下文字”的物理痛点；
2. **纯正 BounceCards 弹性排列与交互效果**：
   - 每个屏幕上的应用窗口呈现为优雅的扇形/自适应卡片阵列；
   - 默认带有微角度错落倾斜（`-3° ~ +3°`）与柔和层叠阴影；
   - **交互 100% 对齐 BounceCards**：
     - 鼠标 Hover 任意卡片时，该卡片**弹跳升起（Spring Bounce）**、摆正（`rotate: 0deg`）、放大 `scale(1.08)` 并置于最前端；
     - 同行/同组两侧的其他卡片自动向外侧推开（`Push Distance` 避让），露出宽敞视觉通道；
     - 鼠标移开时，卡片顺滑弹性回弹至原位；
     - 点击卡片无缝激活置顶目标窗口；
3. **键盘与交互闭环**：
   - 方向键 `←` `→` `↑` `↓` 与 `Tab` 移动选中焦点时，触发同等 BounceCards 弹跳聚焦与平滑推开效果，按 `Enter` 立即激活；
4. **保留台前调度 AnimatedList 侧栏与顶部原生拖拽**；
5. **构建验证、覆盖安装与 GitHub 提交**。

---

## 阶段四实施任务清单

- [x] **任务 1：设计与实现 WindowBounceDeck（同大小卡片弹性布局容器）** `complete`
  - [x] 创建 `src/components/WindowBounceDeck.tsx`：实现统一规范尺寸卡片、动态计算各卡片 Slot 位置与微旋转角度
  - [x] 实现物理弹簧 step 函数与推开动画计算（Push Distance on Hover/Focus），完美呈现 BounceCards 质感

- [x] **任务 2：重构 WindowCard 视觉与排版** `complete`
  - [x] 改造 `src/components/WindowCard.tsx` 为同比例卡片形态（支持固定尺寸与统一排版）
  - [x] 强化应用大图标、应用名、窗口真实标题与序号徽章展示，适配深浅双色主题

- [x] **任务 3：替换主面板渲染为 WindowBounceDeck 架构** `complete`
  - [x] 在 `src/components/WindowMapOverlay.tsx` 中移除旧的绝对屏幕几何映射逻辑，切换为当前屏幕应用的 `WindowBounceDeck`
  - [x] 保留多屏幕 Tab 快速切换（数字键 1-9 与点击）、顶部空白区拖拽移动、深浅主题切换、AnimatedList 台前调度侧栏等优质特性

- [x] **任务 4：键盘导航（方向键/Tab/Enter）深度适配** `complete`
  - [x] 方向键在规范卡片流中按网格/线性顺畅导航，联动触发卡片弹起聚焦与两侧避让

- [x] **任务 5：编译构建、安装验证与 GitHub 提交** `complete`
  - [x] `pnpm build` 与 `cargo check` 验证通过
  - [x] `pnpm tauri build` 编译 release
  - [x] 覆盖安装至 `/Applications/WindowMap.app` 并重启验证
  - [x] 提交代码并推送到 GitHub `main` 分支

---

## 阶段五实施任务清单：顶部专属拖拽区域、打包安装与 GitHub 提交

- [x] **任务 1：配置 Tauri 权限与原生拖拽基础能力** `complete`
  - [x] 在 `src-tauri/capabilities/default.json` 补充 `core:window:default` 与 `core:window:allow-start-dragging` 授权
  - [x] 在 `src-tauri/src/macos/window_ext.rs` 显式设置 NSWindow `setMovable: true`

- [x] **任务 2：设计并实现顶部专属原生拖拽手柄条** `complete`
  - [x] 在 `src/components/WindowMapOverlay.tsx` 顶部卡片首行增加专属拖拽区域
  - [x] 配备 `data-tauri-drag-region` 与 `handleHeaderMouseDown` 异步拖拽触发
  - [x] 居中 macOS 风格动态抓手胶囊（Hover 展开加宽并高亮天蓝色）
  - [x] 左右提示标识与 `GripHorizontal` 图标，光标状态切换 `cursor-grab / cursor-grabbing`

- [x] **任务 3：编译打包与覆盖安装** `complete`
  - [x] 执行 `pnpm tauri build` 编译 release 二进制与 `.app` Bundle
  - [x] 覆盖安装至 `/Applications/WindowMap.app` 并重启验证

- [x] **任务 4：代码提交与推送** `complete`
  - [x] 按照规范提交代码并推送到 GitHub `main` 分支
