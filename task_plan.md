# WindowMap 阶段二功能优化任务计划 (task_plan.md)

## 项目目标
根据用户实测反馈，深度打磨 WindowMap 的交互视觉体验与多任务管理能力：
1. **尺寸自适应与实时调节**：增大默认预览比例至 55%，支持 25%~85% 范围调节并在拖动时实时联动调整原生窗口大小；
2. **独立台前调度（Stage Manager）侧栏**：将屏幕边缘堆叠的台前调度应用剥离为主画布 + 右侧独立收纳侧栏，显示应用名称，支持悬浮 Popover 查看完整信息及一键激活；
3. **主工作区重叠窗口阶梯错落算法**：针对全屏/同位置多窗口，提供阶梯位移（Cascading Offset）、顶部色带与 Hover 展开（Fan-out），保证各窗口露头可见可点；
4. **深浅双色主题（Dark / Light Mode）**：完美支持深色、浅色及跟随系统主题，顶部一键切换，全局毛玻璃与窗口对比度自适应；
5. **激活后可选保留浮层（closeOnActivate）**：支持偏好设置切换，激活应用后可选择自动隐藏或保持地图置顶供连续操作；
6. **编译与更新安装**：构建生产 Release 并覆盖安装到 `/Applications/WindowMap.app`，同步推送到 GitHub。

---

## 优化任务清单

- [ ] **任务 1：Rust IPC 接口与动态窗口定位完善** `in-progress`
  - [x] 在 `src-tauri/src/commands.rs` 中实现 `apply_panel_settings` 与 `close_overlay` 参数
  - [x] 在 `src-tauri/src/lib.rs` 的 `invoke_handler!` 中注册 `apply_panel_settings`
  - [ ] 确保最小窗口尺寸为 760x520，避免在高分屏或大比例下变形

- [ ] **任务 2：前端类型、Store 状态与实时联动** `pending`
  - [x] 更新 `src/types/index.ts`，增加 `theme` 与 `closeOnActivate` 字段
  - [ ] 更新 `src/store/useStore.ts`：
    - 增加深浅色主题切换及 html/class 同步
    - 增加 `closeOnActivate` 配置并传递给 `activate_window`
    - 在更新 `previewRatio` 或 `anchor` 时实时调用 `apply_panel_settings`
    - 分离当前屏幕的 `mainWindows` 与 `stageWindows`

- [ ] **任务 3：视觉样式与错落层叠算法 (WindowCard & Colors)** `pending`
  - [ ] 优化 `src/utils/colors.ts`：为深色和浅色模式分别定义高辨识度色彩、边框与徽章
  - [ ] 优化 `src/components/WindowCard.tsx`：
    - 支持深色/浅色模式自适应样式
    - 优化重叠窗口阶梯偏移（`staggerX = stackIndex * 22`, `staggerY = stackIndex * 22`）
    - Hover 时 `zIndex` 提升至顶层、轻微缩放并增加发光阴影
    - 顶部高亮彩条与序号徽章清晰展现

- [ ] **任务 4：主界面重构与台前调度独立侧栏 (WindowMapOverlay)** `pending`
  - [ ] 在 `src/components/WindowMapOverlay.tsx` 中将布局拆解为：左侧主工作区画布 + 右侧独立台前调度抽屉侧栏
  - [ ] 台前调度列表项显示图标、截断应用名，鼠标悬浮显示丰富 Popover（完整应用名、窗口标题、尺寸、PID）
  - [ ] 顶部栏增加深浅色主题切换按钮（太阳/月亮图标）与多屏幕快捷切换
  - [ ] 底部快捷键指南添加 `whitespace-nowrap`，彻底杜绝换行断字

- [ ] **任务 5：设置弹窗 (SettingsModal) 全面升级** `pending`
  - [ ] 增加深浅色模式（深色 / 浅色 / 跟随系统）选择控件
  - [ ] 增加“点击激活应用后关闭 WindowMap”开关选项
  - [ ] 尺寸滑块范围调整为 25%~85%，拖拽滑块时通过 `apply_panel_settings` 实时改变浮层大小

- [ ] **任务 6：生产编译构建、覆盖安装与 GitHub 推送** `pending`
  - [ ] `pnpm build` 与 `cargo check` 验证通过
  - [ ] `pnpm tauri build` 构建 macOS release 包
  - [ ] 关闭旧进程，覆盖安装到 `/Applications/WindowMap.app` 并清理隔离属性
  - [ ] 启动新版应用并提交所有代码至 GitHub `main` 分支
