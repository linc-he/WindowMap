use crate::commands::show_overlay;
use crate::macos::accessibility::open_accessibility_settings;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let toggle_i = MenuItem::with_id(app, "toggle", "显示 / 隐藏窗口地图", true, None::<&str>)?;
    let perm_i = MenuItem::with_id(app, "permission", "打开辅助功能权限设置", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出 WindowMap", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&toggle_i, &perm_i, &quit_i])?;

    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app_handle, event| match event.id.as_ref() {
            "toggle" => {
                if let Some(win) = app_handle.get_webview_window("main") {
                    if let Ok(is_visible) = win.is_visible() {
                        if is_visible {
                            let _ = win.hide();
                        } else {
                            let _ = show_overlay(app_handle.clone(), None, None);
                        }
                    }
                }
            }
            "permission" => {
                let _ = open_accessibility_settings();
            }
            "quit" => {
                app_handle.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(win) = app.get_webview_window("main") {
                    if let Ok(is_visible) = win.is_visible() {
                        if is_visible {
                            let _ = win.hide();
                        } else {
                            let _ = show_overlay(app.clone(), None, None);
                        }
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
