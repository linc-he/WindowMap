use serde::{Deserialize, Serialize};
use std::ffi::c_void;

#[repr(C)]
#[derive(Debug, Copy, Clone)]
pub struct CGPoint {
    pub x: f64,
    pub y: f64,
}

#[repr(C)]
#[derive(Debug, Copy, Clone)]
pub struct CGSize {
    pub width: f64,
    pub height: f64,
}

#[repr(C)]
#[derive(Debug, Copy, Clone)]
pub struct CGRect {
    pub origin: CGPoint,
    pub size: CGSize,
}

pub type CGDirectDisplayID = u32;
pub type CGError = i32;

#[link(name = "CoreGraphics", kind = "framework")]
extern "C" {
    fn CGGetActiveDisplayList(
        max_displays: u32,
        active_displays: *mut CGDirectDisplayID,
        display_count: *mut u32,
    ) -> CGError;
    fn CGMainDisplayID() -> CGDirectDisplayID;
    fn CGDisplayBounds(display: CGDirectDisplayID) -> CGRect;
    fn CGDisplayCopyDisplayMode(display: CGDirectDisplayID) -> *mut c_void;
    fn CGDisplayModeGetPixelWidth(mode: *mut c_void) -> usize;
    fn CGDisplayModeRelease(mode: *mut c_void);

    fn CGEventCreate(source: *mut c_void) -> *mut c_void;
    fn CGEventGetLocation(event: *mut c_void) -> CGPoint;
    fn CFRelease(cf: *const c_void);
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenInfo {
    pub id: u32,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub scale: f64,
    pub is_main: bool,
}

/// 获取所有活跃屏幕列表（Quartz 坐标系，原点在主屏左上角，Y 向下）
pub fn get_active_screens() -> Vec<ScreenInfo> {
    let mut screens = Vec::new();
    let mut displays = [0u32; 16];
    let mut count = 0u32;

    unsafe {
        let err = CGGetActiveDisplayList(16, displays.as_mut_ptr(), &mut count);
        if err != 0 {
            return screens;
        }

        let main_id = CGMainDisplayID();

        for i in 0..count as usize {
            let display_id = displays[i];
            let bounds = CGDisplayBounds(display_id);

            let mut scale = 1.0;
            let mode = CGDisplayCopyDisplayMode(display_id);
            if !mode.is_null() {
                let pixel_w = CGDisplayModeGetPixelWidth(mode);
                if bounds.size.width > 0.0 {
                    scale = pixel_w as f64 / bounds.size.width;
                }
                CGDisplayModeRelease(mode);
            }

            screens.push(ScreenInfo {
                id: display_id,
                x: bounds.origin.x,
                y: bounds.origin.y,
                width: bounds.size.width,
                height: bounds.size.height,
                scale,
                is_main: display_id == main_id,
            });
        }
    }

    screens
}

/// 获取当前鼠标所在的屏幕
pub fn get_mouse_screen() -> Option<ScreenInfo> {
    let screens = get_active_screens();
    if screens.is_empty() {
        return None;
    }

    let mouse_pt = unsafe {
        let event = CGEventCreate(std::ptr::null_mut());
        if event.is_null() {
            return screens.into_iter().find(|s| s.is_main);
        }
        let loc = CGEventGetLocation(event);
        CFRelease(event);
        loc
    };

    // 查找包含该鼠标坐标的屏幕
    for screen in &screens {
        if mouse_pt.x >= screen.x
            && mouse_pt.x < screen.x + screen.width
            && mouse_pt.y >= screen.y
            && mouse_pt.y < screen.y + screen.height
        {
            return Some(screen.clone());
        }
    }

    // 默认返回主屏
    screens.into_iter().find(|s| s.is_main)
}
