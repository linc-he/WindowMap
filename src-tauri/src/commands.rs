use crate::macos::accessibility::{is_accessibility_trusted, open_accessibility_settings};
use crate::macos::activate::activate_window as macos_activate_window;
use crate::macos::screen::{get_active_screens, get_mouse_screen, ScreenInfo};
use crate::macos::window::{list_windows as macos_list_windows, WindowInfo};
use crate::macos::window_ext::position_overlay;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

#[tauri::command]
pub fn get_screens() -> Result<Vec<ScreenInfo>, String> {
    Ok(get_active_screens())
}

#[tauri::command]
pub fn get_current_screen() -> Result<ScreenInfo, String> {
    get_mouse_screen().ok_or_else(|| "无法获取当前屏幕".to_string())
}

#[tauri::command]
pub fn list_windows() -> Result<Vec<WindowInfo>, String> {
    Ok(macos_list_windows())
}

#[tauri::command]
pub fn activate_window(
    app: AppHandle,
    pid: i32,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    close_overlay: Option<bool>,
) -> Result<(), String> {
    // 1. 若配置为激活后关闭，则隐藏地图面板；若为 false 则保持驻留
    if close_overlay.unwrap_or(true) {
        if let Some(win) = app.get_webview_window("main") {
            let _ = win.hide();
        }
    }

    // 2. 激活目标窗口
    macos_activate_window(pid, x, y, width, height)
}

#[tauri::command]
pub fn hide_overlay(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.hide();
    }
    Ok(())
}

#[tauri::command]
pub fn show_overlay(
    app: AppHandle,
    anchor: Option<String>,
    ratio: Option<f64>,
) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        if let Some(screen) = get_mouse_screen() {
            let anchor_val = anchor.unwrap_or_else(|| "center".to_string());
            let ratio_val = ratio.unwrap_or(0.55);
            let _ = position_overlay(&win, &screen, &anchor_val, ratio_val);
        }
        let _ = win.show();
        let _ = win.set_focus();
        let _ = win.emit("overlay-opened", ());
    }
    Ok(())
}

#[tauri::command]
pub fn apply_panel_settings(
    app: AppHandle,
    anchor: String,
    ratio: f64,
) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        if let Some(screen) = get_mouse_screen() {
            let _ = position_overlay(&win, &screen, &anchor, ratio);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn get_accessibility_status() -> Result<bool, String> {
    Ok(is_accessibility_trusted())
}

#[tauri::command]
pub fn request_accessibility_settings() -> Result<(), String> {
    open_accessibility_settings()
}

#[tauri::command]
pub fn update_global_shortcut(
    app: AppHandle,
    old_shortcut: Option<String>,
    new_shortcut: String,
) -> Result<(), String> {
    if let Some(old) = old_shortcut {
        if let Ok(sc) = old.parse::<Shortcut>() {
            let _ = app.global_shortcut().unregister(sc);
        }
    }

    let sc = new_shortcut
        .parse::<Shortcut>()
        .map_err(|e| format!("快捷键格式无效: {}", e))?;

    let app_handle = app.clone();
    app.global_shortcut()
        .on_shortcut(sc, move |_app, _sc, event| {
            if event.state() == ShortcutState::Pressed {
                crate::toggle_overlay(&app_handle);
            }
        })
        .map_err(|e| format!("注册快捷键失败，可能被占用: {}", e))?;

    Ok(())
}
