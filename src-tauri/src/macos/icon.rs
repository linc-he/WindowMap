use base64::Engine;
use cocoa::base::{id, nil};
use objc::{class, msg_send, sel, sel_impl};
use std::collections::HashMap;
use std::sync::Mutex;

// 简单的 App 图标内存缓存：key 为 bundle_id 或 app_name，value 为 "data:image/png;base64,..."
static ICON_CACHE: Mutex<Option<HashMap<String, String>>> = Mutex::new(None);

pub fn get_cached_icon(cache_key: &str) -> Option<String> {
    if let Ok(guard) = ICON_CACHE.lock() {
        if let Some(map) = &*guard {
            return map.get(cache_key).cloned();
        }
    }
    None
}

pub fn save_cached_icon(cache_key: String, base64_str: String) {
    if let Ok(mut guard) = ICON_CACHE.lock() {
        if guard.is_none() {
            *guard = Some(HashMap::new());
        }
        if let Some(map) = guard.as_mut() {
            map.insert(cache_key, base64_str);
        }
    }
}

/// 根据 PID 提取 App 图标为 Base64 PNG 数据 URI
pub fn extract_app_icon(pid: i32, cache_key: &str) -> Option<String> {
    if let Some(cached) = get_cached_icon(cache_key) {
        return Some(cached);
    }

    unsafe {
        let app: id = msg_send![
            class!(NSRunningApplication),
            runningApplicationWithProcessIdentifier: pid
        ];
        if app == nil {
            return None;
        }

        let icon: id = msg_send![app, icon];
        if icon == nil {
            return None;
        }

        // 获取 TIFF 数据
        let tiff: id = msg_send![icon, TIFFRepresentation];
        if tiff == nil {
            return None;
        }

        // 转为 NSBitmapImageRep
        let rep: id = msg_send![class!(NSBitmapImageRep), imageRepWithData: tiff];
        if rep == nil {
            return None;
        }

        // NSPNGFileType = 4 (or NSBitmapImageFileTypePNG = 4)
        let png_data: id = msg_send![
            rep,
            representationUsingType: 4usize
            properties: nil
        ];
        if png_data == nil {
            return None;
        }

        let len: usize = msg_send![png_data, length];
        let bytes: *const u8 = msg_send![png_data, bytes];
        if bytes.is_null() || len == 0 {
            return None;
        }

        let slice = std::slice::from_raw_parts(bytes, len);
        let b64 = base64::engine::general_purpose::STANDARD.encode(slice);
        let data_url = format!("data:image/png;base64,{}", b64);

        save_cached_icon(cache_key.to_string(), data_url.clone());
        Some(data_url)
    }
}
