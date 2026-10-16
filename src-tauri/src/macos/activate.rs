use cocoa::base::{id, nil};
use core_foundation::array::CFArray;
use core_foundation::base::{CFType, CFTypeRef, TCFType};
use core_foundation::boolean::CFBoolean;
use core_foundation::string::CFString;
use objc::{class, msg_send, sel, sel_impl};
use std::ffi::c_void;

pub type AXUIElementRef = *mut c_void;
pub type AXValueRef = *mut c_void;
pub type AXError = i32;

// AXValueType
const K_AX_VALUE_CG_POINT_TYPE: u32 = 1;
const K_AX_VALUE_CG_SIZE_TYPE: u32 = 2;

#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    fn AXUIElementCreateApplication(pid: i32) -> AXUIElementRef;
    fn AXUIElementCopyAttributeValue(
        element: AXUIElementRef,
        attribute: CFTypeRef,
        value: *mut CFTypeRef,
    ) -> AXError;
    fn AXUIElementPerformAction(element: AXUIElementRef, action: CFTypeRef) -> AXError;
    fn AXUIElementSetAttributeValue(
        element: AXUIElementRef,
        attribute: CFTypeRef,
        value: CFTypeRef,
    ) -> AXError;
    fn AXValueGetValue(value: AXValueRef, the_type: u32, value_ptr: *mut c_void) -> bool;
    fn CFRelease(cf: *const c_void);
}

/// 激活指定 PID 的应用及其指定位置的窗口
pub fn activate_window(
    pid: i32,
    target_x: f64,
    target_y: f64,
    _target_w: f64,
    _target_h: f64,
) -> Result<(), String> {
    unsafe {
        // 1. 先通过 NSRunningApplication 激活该进程
        let app: id = msg_send![
            class!(NSRunningApplication),
            runningApplicationWithProcessIdentifier: pid
        ];
        if app != nil {
            // NSApplicationActivateIgnoringOtherApps = 1 << 1 (2)
            let _: bool = msg_send![app, activateWithOptions: 2usize];
        } else {
            return Err(format!("未找到 PID 为 {} 的应用程序", pid));
        }

        // 2. 尝试利用 Accessibility API 将特定窗口 Raise 置顶
        let app_element = AXUIElementCreateApplication(pid);
        if app_element.is_null() {
            return Ok(());
        }

        let k_windows = CFString::new("AXWindows");
        let mut windows_ref: CFTypeRef = std::ptr::null_mut();
        let err = AXUIElementCopyAttributeValue(
            app_element,
            k_windows.as_CFTypeRef(),
            &mut windows_ref,
        );

        if err == 0 && !windows_ref.is_null() {
            let windows_array: CFArray<CFType> =
                CFArray::wrap_under_create_rule(windows_ref as _);
            let count = windows_array.len();

            let k_pos = CFString::new("AXPosition");
            let k_size = CFString::new("AXSize");
            let k_raise = CFString::new("AXRaise");
            let k_main = CFString::new("AXMain");

            for i in 0..count {
                let win_item = windows_array.get(i).unwrap();
                let win_element = win_item.as_CFTypeRef() as AXUIElementRef;

                let mut pos_ref: CFTypeRef = std::ptr::null_mut();
                let mut size_ref: CFTypeRef = std::ptr::null_mut();

                let mut pos = crate::macos::screen::CGPoint { x: 0.0, y: 0.0 };
                let mut size = crate::macos::screen::CGSize {
                    width: 0.0,
                    height: 0.0,
                };

                let has_pos = AXUIElementCopyAttributeValue(
                    win_element,
                    k_pos.as_CFTypeRef(),
                    &mut pos_ref,
                ) == 0
                    && !pos_ref.is_null()
                    && AXValueGetValue(
                        pos_ref as AXValueRef,
                        K_AX_VALUE_CG_POINT_TYPE,
                        &mut pos as *mut _ as *mut c_void,
                    );

                let _has_size = AXUIElementCopyAttributeValue(
                    win_element,
                    k_size.as_CFTypeRef(),
                    &mut size_ref,
                ) == 0
                    && !size_ref.is_null()
                    && AXValueGetValue(
                        size_ref as AXValueRef,
                        K_AX_VALUE_CG_SIZE_TYPE,
                        &mut size as *mut _ as *mut c_void,
                    );

                if !pos_ref.is_null() {
                    CFRelease(pos_ref);
                }
                if !size_ref.is_null() {
                    CFRelease(size_ref);
                }

                // 容差比较：位置差在 5px 内即视为命中目标窗口
                if has_pos && (pos.x - target_x).abs() < 6.0 && (pos.y - target_y).abs() < 6.0 {
                    let _ = AXUIElementPerformAction(win_element, k_raise.as_CFTypeRef());
                    let _ = AXUIElementSetAttributeValue(
                        win_element,
                        k_main.as_CFTypeRef(),
                        CFBoolean::true_value().as_CFTypeRef(),
                    );
                    break;
                }
            }
        }

        CFRelease(app_element as *const c_void);
    }

    Ok(())
}
