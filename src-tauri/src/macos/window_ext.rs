use cocoa::base::{id, nil};
use objc::{msg_send, sel, sel_impl};
use tauri::{LogicalPosition, LogicalSize, WebviewWindow};

use crate::macos::screen::ScreenInfo;

/// 配置 Overlay NSWindow：支持跨所有工作区（Space）和全屏应用上层弹出，设置最高置顶层级
pub fn setup_overlay_window(window: &WebviewWindow) {
    if let Ok(ns_win_ptr) = window.ns_window() {
        let ns_window = ns_win_ptr as id;
        if ns_window != nil {
            unsafe {
                // NSWindowCollectionBehavior:
                // CanJoinAllSpaces (1 << 0)
                // FullScreenAuxiliary (1 << 8)
                // Transient (1 << 3)
                // IgnoresCycle (1 << 6)
                let behavior: usize = (1 << 0) | (1 << 8) | (1 << 3) | (1 << 6);
                let _: () = msg_send![ns_window, setCollectionBehavior: behavior];

                // NSStatusWindowLevel = 25 (高于普通浮动窗口，保证快捷键唤起时永远在最前端)
                let _: () = msg_send![ns_window, setLevel: 25usize];

                // 允许窗口在失去焦点时也能捕获点击
                let _: () = msg_send![ns_window, setHidesOnDeactivate: false];

                // 明确设置无边框窗口可被拖动
                let _: () = msg_send![ns_window, setMovable: true];
            }
        }
    }
}

/// 将 Overlay 移动并缩放到目标屏幕与指定锚点
pub fn position_overlay(
    window: &WebviewWindow,
    screen: &ScreenInfo,
    anchor: &str,
    ratio: f64,
) -> Result<(), String> {
    let margin = 24.0;
    // 支持 25% ~ 85% 比例动态缩放
    let ratio = ratio.clamp(0.25, 0.85);

    let panel_w = (screen.width * ratio).max(640.0).min(screen.width - margin * 2.0);
    let panel_h = (screen.height * ratio).max(460.0).min(screen.height - margin * 2.0 - 24.0);

    let (panel_x, panel_y) = match anchor {
        "top-left" => (screen.x + margin, screen.y + margin + 28.0), // +28 预留 macOS 菜单栏
        "top-right" => (
            screen.x + screen.width - panel_w - margin,
            screen.y + margin + 28.0,
        ),
        "bottom-left" => (
            screen.x + margin,
            screen.y + screen.height - panel_h - margin,
        ),
        "bottom-right" => (
            screen.x + screen.width - panel_w - margin,
            screen.y + screen.height - panel_h - margin,
        ),
        _ => (
            // center
            screen.x + (screen.width - panel_w) / 2.0,
            screen.y + (screen.height - panel_h) / 2.0,
        ),
    };

    let _ = window.set_size(LogicalSize::new(panel_w, panel_h));
    let _ = window.set_position(LogicalPosition::new(panel_x, panel_y));

    Ok(())
}
