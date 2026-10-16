pub mod commands;
pub mod macos;
pub mod tray;

use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

pub fn toggle_overlay(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        if let Ok(is_visible) = win.is_visible() {
            if is_visible {
                let _ = win.hide();
            } else {
                let _ = commands::show_overlay(app.clone(), None, None);
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // 1. 初始化 Overlay 窗口的 macOS 原生属性（跨 Space、置顶、全屏上层显示）
            if let Some(main_window) = app.get_webview_window("main") {
                macos::window_ext::setup_overlay_window(&main_window);
            }

            // 2. 初始化菜单栏托盘
            if let Err(err) = tray::setup_tray(app.handle()) {
                eprintln!("初始化托盘失败: {}", err);
            }

            // 3. 注册全局默认快捷键 Option+Space (Alt+Space)
            if let Ok(shortcut) = "Alt+Space".parse::<Shortcut>() {
                let app_handle = app.handle().clone();
                let _ = app.global_shortcut().on_shortcut(shortcut, move |_app, _sc, event| {
                    if event.state() == ShortcutState::Pressed {
                        toggle_overlay(&app_handle);
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_screens,
            commands::get_current_screen,
            commands::list_windows,
            commands::activate_window,
            commands::hide_overlay,
            commands::show_overlay,
            commands::get_accessibility_status,
            commands::request_accessibility_settings,
            commands::update_global_shortcut,
        ])
        .run(tauri::generate_context!())
        .expect("运行 WindowMap 应用程序出错");
}
