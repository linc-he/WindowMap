# WindowMap 任务计划与进度跟踪 (task_plan.md)

## 项目目标
根据用户提出的深度交互建议，全面提升 WindowMap 的操作手感、视觉质感与多窗口管理可用性：
1. **窗口顶部空白区拖拽移动**：支持鼠标按住 WindowMap 面板顶部空白区域原生拖拽移动面板，同时保证内部按钮与 Tab 点击不冲突；
2. **彻底清理无意义的系统后台进程**：在 Rust 原生层与前端双重过滤 `WindowManager`、`WindowServer` 等系统辅助窗口，只保留真实活跃 App；
3. **基于 BounceCards 机制的主画布错落与避让展开**：
   - 彻底解决“大窗口覆盖小窗口导致底层无法切换”的问题；
   - 引入类似 React Bits BounceCards 的弹性扇形/避让发散机制：当多窗口重叠时，鼠标悬浮自动向四周弹开发散（Fan-out Spread），将所有隐藏在后方的窗口摊开展现；
   - 支持键盘方向键与鼠标点击精确激活；
4. **台前调度侧栏重构为 AnimatedList 动效流**：
   - 参考 React Bits AnimatedList 设计，引入弹性光标跟随时滑块（Gliding Indicator）、上下渐变边缘遮罩（Fade Mask）与流畅进场弹动；
   - 保持 Hover Popover 查看完整信息，增强键盘上下键交互体验；
5. **编译、覆盖安装与 GitHub 提交**：测试通过后编译生产包并更新安装至 `/Applications/WindowMap.app`，推送到远程仓库。

---

## 阶段三详细任务清单

- [x] **任务 1：窗口顶部空白区原生拖拽支持** `complete`
  - [x] 在 `src/components/WindowMapOverlay.tsx` 顶部标题栏空白区域配置 Tauri 拖拽区域（`data-tauri-drag-region` 与 `startDragging`）
  - [x] 确保按钮、显示器切换 Tab、深浅切换等交互元素具备 `onMouseDown={(e) => e.stopPropagation()}`，防止误触拖拽

- [x] **任务 2：彻底过滤系统无意义进程（WindowManager 等）** `complete`
  - [x] 在 `src-tauri/src/macos/window.rs` 的系统过滤列表中加入 `WindowManager`、`com.apple.WindowManager` 等
  - [x] 在前端 `src/store/useStore.ts` 的 `filterWindowsForScreen` 增加净化逻辑，过滤无效无界面的后台助手进程

- [x] **任务 3：基于 BounceCards 机制的主画布错落避让与弹发展开** `complete`
  - [x] 实现重叠区域碰撞检测与扇形发散展开（Fan-out / Spread Engine）：当区域存在多个大小不一的重叠窗口时，Hover 自动向外推开其他窗口（`pushDistance`）
  - [x] 确保小窗口永远不被大窗口完全淹没，小窗口自动获得优先露出或展开偏移
  - [x] 实现平滑弹簧动效（Spring physics），悬浮聚焦窗口直立抬升，周围卡片自然退让

- [x] **任务 4：台前调度重构为 AnimatedList 风格** `complete`
  - [x] 重构 `src/components/StageManagerShelf.tsx`，加入 AnimatedList 经典视觉元素：
    - 上下边缘羽化遮罩（Gradient Fade Mask）
    - 平滑滑动的选中/Hover 背景游标（Gliding Selection Pill）
    - 优化条目排版与弹性 Hover 微动效
  - [x] 保持详细 Popover 浮层预览

- [x] **任务 5：编译验证、覆盖安装与 GitHub 推送** `complete`
  - [x] `pnpm build` 与 `cargo check` 验证
  - [x] `pnpm tauri build` 生产构建
  - [x] 覆盖安装到 `/Applications/WindowMap.app` 并重启验证
  - [x] 提交 Commit 并推送到 GitHub `main` 分支
