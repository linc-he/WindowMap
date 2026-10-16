# 技术发现与架构备忘 (findings.md)

## 1. macOS 坐标系统说明
- **Cocoa (NSScreen)**: 原点在主屏幕左下角，Y 轴向上增长。
- **Core Graphics / Quartz (`CGWindowListCopyWindowInfo`, `CGDisplayBounds`)**: 原点在主屏幕左上角，X 轴向右增长，Y 轴向下增长。
- **React / HTML DOM**: 原点在容器左上角，X 向右，Y 向下。
- **结论**: 只要在 Rust 端获取统一的 Quartz 显示屏 Bounds（`CGDisplayBounds`），与 `kCGWindowBounds` 进行相对偏移计算，就无需做 Y 轴翻转，公式为：
  `scaleX = panelWidth / screenWidth`
  `scaleY = panelHeight / screenHeight`
  `rectX = (winX - screenX) * scaleX`
  `rectY = (winY - screenY) * scaleY`
  `rectW = winW * scaleX`
  `rectH = winH * scaleY`

## 2. 权限说明与最佳实践
- **Screen Recording (录屏权限)**: 不申请、不依赖。避免用户的安全顾虑与系统频繁的授权弹窗。
- **Accessibility (辅助功能权限)**:
  - 检测方式：`AXIsProcessTrusted()`
  - 授权打开方式：`open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"`
  - 功能用途：用于通过 `AXUIElement` 搜索目标窗口并触发 `kAXRaiseAction`，以及可选读取 `kAXTitleAttribute`。

## 3. macOS 浮层窗口特性
- `LSUIElement = true`: 菜单栏 Agent 应用，不在 Dock 栏常驻，不抢占 Command+Tab 应用切换焦点。
- `NSWindowCollectionBehavior`:
  - `NSWindowCollectionBehaviorCanJoinAllSpaces` (使得浮层能在所有 Space 和全屏桌面弹出)
  - `NSWindowCollectionBehaviorFullScreenAuxiliary` (允许在全屏 App 界面上层显示)
- `level = NSStatusWindowLevel` (25): 确保地图浮层在任何窗口之上。

## 4. 图标缓存设计
- 通过 `NSRunningApplication.icon` 提取 `TIFFRepresentation` -> 转为 PNG -> 编码 Base64 Data URL。
- 在 Rust 侧以应用名 / BundleID 为键维护 `Mutex<HashMap<String, String>>` 缓存，大幅降低重复解码与内存开销。
