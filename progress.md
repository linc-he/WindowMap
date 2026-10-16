# WindowMap 进度更新 (progress.md)

## 当前进度状态
- **阶段一与阶段二**：已全面完成
- **阶段三体验深化与重构**：
  1. [x] **窗口顶部空白位置原生拖拽移动**：
     - 在 `WindowMapOverlay.tsx` 顶部标题栏区域集成 `data-tauri-drag-region` 与 `getCurrentWebviewWindow().startDragging()`；
     - 隔离按钮、显示器切换 Tab、深浅切换等交互元素，避免误触拖拽；
  2. [x] **彻底清理系统后台无意义进程（WindowManager 等）**：
     - 在 Rust 层的 `window.rs` 中将 `WindowManager`、`com.apple.WindowManager`、`WindowServer`、`SystemUIServer`、`Spotlight` 等加入系统黑名单；
     - 在前端 `useStore.ts` 中加入双重安全过滤，彻底净化台前调度侧栏列表；
  3. [x] **BounceCards 式空间错落避让与弹发展开引擎**：
     - 面积小的窗口初始赋予更高 `baseZIndex`，杜绝大窗口盖死小窗口；
     - 当鼠标悬停在重叠簇时，启用 BounceCards 式扇形弹力推开机制（`pushDistance` 扩散与微角度旋转），底层的多层窗口瞬间散开露出供点选；
     - 配合弹簧曲线动效（`cubic-bezier(0.34, 1.4, 0.64, 1)`），手感灵动顺滑；
  4. [x] **台前调度 AnimatedList 动效流升级**：
     - 上下边缘增加羽化渐变遮罩（Fade Mask）；
     - 增加滑动跟随胶囊选择指示器（Gliding Pill Indicator）；
     - 保留悬浮 Popover 详细信息预览；
  5. [-] **生产构建与覆盖安装**：
     - `pnpm tauri build` 正在编译打包中，构建后将自动安装至 `/Applications/WindowMap.app` 并推送到 GitHub。
