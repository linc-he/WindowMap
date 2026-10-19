# WindowMap 进度更新 (progress.md)

## 当前进度状态
- **核心开发方向成功重构落地**：
  1. [x] **告别物理几何映射，全面转型同比例 BounceCards 规范卡片**：
     - 所有窗口采用统一 244px × 152px 黄金比例卡片；
     - 彻底根除“大窗口挡死小窗口”、“缩略图变形太扁”的顽疾；
     - 每张卡片均呈现 28px 高清应用大图标、大号应用名、窗口具体标题标签、专属特征彩条与序号徽章；
  2. [x] **纯正 BounceCards 弹性堆叠与交互**：
     - 卡片带有自然微角度错落倾斜（`-3.2° ~ +3.0°`）；
     - 鼠标 Hover 或键盘方向键聚焦时：该卡片弹跳升起、直立摆正、放大 `scale(1.08)` 并置顶；
     - 同组/两侧其他卡片向外自动推开避让（`Push Distance` 52px），露出开阔视觉通道；
     - 点击卡片直接激活置顶目标应用；
  3. [x] **台前调度 AnimatedList 动效侧栏**：
     - 彻底过滤 `WindowManager` 等无意义系统辅助进程；
     - 具备流畅滑动的选中胶囊（Gliding Indicator Pill）与上下羽化遮罩；
  4. [x] **顶部专属拖拽区域与能力强化**：
     - 在窗口毛玻璃卡片最顶部首行增加专属拖拽区域；
     - 居中呈现 macOS 风格交互抓手胶囊（悬停自动平滑展开变宽，光标切换为 `cursor-grab / cursor-grabbing`）；
     - 显式配置 Tauri 权限 (`core:window:default`, `core:window:allow-start-dragging`) 与 NSWindow `setMovable: true`，确保跨平台拖拽与原生交互可靠平移；
     - 标配 `data-tauri-drag-region` 与 `startDragging()` 双保险机制；
  5. [x] **最新版本已编译、安装并运行**：
     - 已通过 `pnpm tauri build` 重新编译 release 版本；
     - 已覆盖安装至 `/Applications/WindowMap.app` 并已在后台重新启动；
     - 源代码即将提交推送至 GitHub `main` 分支。
