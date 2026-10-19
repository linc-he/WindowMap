use crate::macos::icon::extract_app_icon;
use crate::macos::screen::{get_active_screens, CGRect};
use core_foundation::array::CFArray;
use core_foundation::base::{CFType, TCFType};
use core_foundation::boolean::CFBoolean;
use core_foundation::dictionary::CFDictionary;
use core_foundation::number::CFNumber;
use core_foundation::string::CFString;
use serde::{Deserialize, Serialize};
use std::ffi::c_void;

pub type CGWindowID = u32;

pub const K_CG_WINDOW_LIST_OPTION_ON_SCREEN_ONLY: u32 = 1;
pub const K_CG_WINDOW_LIST_EXCLUDE_DESKTOP_ELEMENTS: u32 = 16;
pub const K_CG_NULL_WINDOW_ID: u32 = 0;

#[link(name = "CoreGraphics", kind = "framework")]
extern "C" {
    fn CGWindowListCopyWindowInfo(option: u32, relative_to_window: CGWindowID) -> *mut c_void;
    fn CGRectMakeWithDictionaryRepresentation(
        dict: *const c_void,
        rect: *mut CGRect,
    ) -> bool;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowInfo {
    pub window_id: u32,
    pub pid: i32,
    pub app_name: String,
    pub app_icon: Option<String>,
    pub title: Option<String>,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub layer: i32,
    pub is_on_screen: bool,
    pub z_order: usize,
    pub is_stage_manager: bool,
    pub screen_id: u32,
}

pub fn list_windows() -> Vec<WindowInfo> {
    let mut windows = Vec::new();
    let current_pid = std::process::id() as i32;
    let screens = get_active_screens();

    unsafe {
        let list_ptr = CGWindowListCopyWindowInfo(
            K_CG_WINDOW_LIST_OPTION_ON_SCREEN_ONLY | K_CG_WINDOW_LIST_EXCLUDE_DESKTOP_ELEMENTS,
            K_CG_NULL_WINDOW_ID,
        );

        if list_ptr.is_null() {
            return windows;
        }

        let cf_array: CFArray<CFType> = CFArray::wrap_under_create_rule(list_ptr as _);
        let count = cf_array.len();

        let k_num = CFString::new("kCGWindowNumber");
        let k_pid = CFString::new("kCGWindowOwnerPID");
        let k_owner = CFString::new("kCGWindowOwnerName");
        let k_name = CFString::new("kCGWindowName");
        let k_bounds = CFString::new("kCGWindowBounds");
        let k_layer = CFString::new("kCGWindowLayer");
        let k_onscreen = CFString::new("kCGWindowIsOnscreen");
        let k_alpha = CFString::new("kCGWindowAlpha");

        for i in 0..count {
            let item_ref = cf_array.get(i).unwrap();
            let dict: CFDictionary<CFString, CFType> =
                CFDictionary::wrap_under_get_rule(item_ref.as_CFTypeRef() as _);

            // 1. 过滤非 layer 0 的窗口（Layer 0 为标准应用窗口）
            let layer: i32 = match dict.find(&k_layer) {
                Some(val) => {
                    let num = CFNumber::wrap_under_get_rule(val.as_CFTypeRef() as _);
                    num.to_i32().unwrap_or(0)
                }
                None => 0,
            };
            if layer != 0 {
                continue;
            }

            // 过滤完全透明或近似透明的隐藏/幽灵窗口
            let alpha: f64 = match dict.find(&k_alpha) {
                Some(val) => {
                    let num = CFNumber::wrap_under_get_rule(val.as_CFTypeRef() as _);
                    num.to_f64().unwrap_or(1.0)
                }
                None => 1.0,
            };
            if alpha < 0.05 {
                continue;
            }

            // 2. 获取 PID
            let pid: i32 = match dict.find(&k_pid) {
                Some(val) => {
                    let num = CFNumber::wrap_under_get_rule(val.as_CFTypeRef() as _);
                    num.to_i32().unwrap_or(0)
                }
                None => continue,
            };

            // 过滤自身进程
            if pid == current_pid {
                continue;
            }

            // 3. 获取 Window ID
            let window_id: u32 = match dict.find(&k_num) {
                Some(val) => {
                    let num = CFNumber::wrap_under_get_rule(val.as_CFTypeRef() as _);
                    num.to_i32().unwrap_or(0) as u32
                }
                None => continue,
            };

            // 4. 获取应用名称
            let app_name: String = match dict.find(&k_owner) {
                Some(val) => {
                    let s = CFString::wrap_under_get_rule(val.as_CFTypeRef() as _);
                    s.to_string()
                }
                None => String::new(),
            };

            // 过滤系统空应用或特定后台服务（包括 WindowManager、Window Server、Dock 等辅助图层）
            if app_name.is_empty()
                || app_name == "WindowManager"
                || app_name == "Window Server"
                || app_name == "WindowServer"
                || app_name == "Dock"
                || app_name == "控制中心"
                || app_name == "通知中心"
                || app_name == "ControlCenter"
                || app_name == "NotificationCenter"
                || app_name == "SystemUIServer"
                || app_name == "Spotlight"
                || app_name == "loginwindow"
            {
                continue;
            }

            // 5. 获取窗口标题（如果有）
            let title: Option<String> = dict.find(&k_name).and_then(|val| {
                let s = CFString::wrap_under_get_rule(val.as_CFTypeRef() as _);
                let string = s.to_string();
                if string.is_empty() {
                    None
                } else {
                    Some(string)
                }
            });

            // 6. 获取 Bounds
            let mut rect = CGRect {
                origin: crate::macos::screen::CGPoint { x: 0.0, y: 0.0 },
                size: crate::macos::screen::CGSize {
                    width: 0.0,
                    height: 0.0,
                },
            };
            if let Some(bounds_val) = dict.find(&k_bounds) {
                let ok = CGRectMakeWithDictionaryRepresentation(
                    bounds_val.as_CFTypeRef() as _,
                    &mut rect,
                );
                if !ok {
                    continue;
                }
            } else {
                continue;
            }

            // 过滤尺寸过小的幽灵窗口/状态栏窗口（保留台前调度中较窄的缩略图）
            if rect.size.width < 20.0 || rect.size.height < 20.0 {
                continue;
            }

            // 7. 是否在屏幕上
            let is_on_screen: bool = match dict.find(&k_onscreen) {
                Some(val) => {
                    let b = CFBoolean::wrap_under_get_rule(val.as_CFTypeRef() as _);
                    b == CFBoolean::true_value()
                }
                None => true,
            };

            // 8. 判定该窗口归属哪一个屏幕，以及是否为台前调度侧栏项
            let center_x = rect.origin.x + rect.size.width / 2.0;
            let center_y = rect.origin.y + rect.size.height / 2.0;

            let target_screen = screens.iter().find(|s| {
                center_x >= s.x && center_x < s.x + s.width && center_y >= s.y && center_y < s.y + s.height
            }).or_else(|| {
                screens.iter().find(|s| {
                    rect.origin.x < s.x + s.width && rect.origin.x + rect.size.width > s.x
                        && rect.origin.y < s.y + s.height && rect.origin.y + rect.size.height > s.y
                })
            });

            let screen_id = target_screen.map(|s| s.id).unwrap_or(0);

            // 台前调度侧栏应用特征：
            // 当 macOS 开启 Stage Manager 时，未激活的应用会缩放到屏幕左侧/右侧窄条
            let is_stage_manager = if let Some(s) = target_screen {
                let is_near_left = rect.origin.x <= s.x + 160.0;
                let is_near_right = rect.origin.x + rect.size.width >= s.x + s.width - 160.0;
                let is_narrow_shelf = rect.size.width < 420.0 && rect.size.height < 650.0;
                (is_near_left || is_near_right) && is_narrow_shelf
            } else {
                false
            };

            // 去重：若同一进程已存在完全重叠几何尺寸的窗口，优先保留有具体标题的条目
            let mut is_duplicate = false;
            for existing in &mut windows {
                if existing.pid == pid
                    && (existing.x - rect.origin.x).abs() < 1.0
                    && (existing.y - rect.origin.y).abs() < 1.0
                    && (existing.width - rect.size.width).abs() < 1.0
                    && (existing.height - rect.size.height).abs() < 1.0
                {
                    is_duplicate = true;
                    if existing.title.is_none() && title.is_some() {
                        existing.title = title.clone();
                    }
                    break;
                }
            }
            if is_duplicate {
                continue;
            }

            // 9. 提取图标（利用 PID 提取，以 app_name 为缓存 Key）
            let app_icon = extract_app_icon(pid, &app_name);

            windows.push(WindowInfo {
                window_id,
                pid,
                app_name,
                app_icon,
                title,
                x: rect.origin.x,
                y: rect.origin.y,
                width: rect.size.width,
                height: rect.size.height,
                layer,
                is_on_screen,
                z_order: windows.len(),
                is_stage_manager,
                screen_id,
            });
        }
    }

    windows
}
