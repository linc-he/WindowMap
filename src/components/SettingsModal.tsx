import React, { useState } from "react";
import { X, Check, Monitor, Sliders, Keyboard, Shield } from "lucide-react";
import { useStore } from "../store/useStore";
import { AnchorPosition } from "../types";

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    showSettings,
    setShowSettings,
    isAccessibilityGranted,
    openPermissionSettings,
    checkPermission,
  } = useStore();

  const [shortcutText, setShortcutText] = useState(settings.shortcut);

  if (!showSettings) return null;

  const anchors: { id: AnchorPosition; label: string }[] = [
    { id: "top-left", label: "左上角" },
    { id: "top-right", label: "右上角" },
    { id: "center", label: "屏幕居中" },
    { id: "bottom-left", label: "左下角" },
    { id: "bottom-right", label: "右下角" },
  ];

  return (
    <div
      onClick={() => setShowSettings(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-neutral-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-200"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-neutral-850">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              WindowMap 偏好设置
            </h2>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {/* 全局快捷键 */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <Keyboard className="w-3.5 h-3.5 text-neutral-400" />
              全局唤起快捷键
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shortcutText}
                onChange={(e) => {
                  setShortcutText(e.target.value);
                  updateSettings({ shortcut: e.target.value });
                }}
                placeholder="例如: Alt+Space 或 Command+Option+M"
                className="flex-1 bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <p className="text-[11px] text-neutral-500">
              macOS 下 Option 对应 Alt，支持如 Alt+Space、Ctrl+Space 等。
            </p>
          </div>

          {/* 预览锚点位置 */}
          <div className="space-y-1.5">
            <label className="text-neutral-300 font-medium block">
              浮层弹出锚点
            </label>
            <div className="grid grid-cols-3 gap-2">
              {anchors.map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateSettings({ anchor: item.id })}
                  className={`py-2 px-3 rounded-lg border text-center transition cursor-pointer ${
                    settings.anchor === item.id
                      ? "border-sky-500 bg-sky-500/20 text-sky-300 font-medium"
                      : "border-white/10 bg-neutral-800 hover:border-white/20 text-neutral-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 预览大小比例 */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-neutral-300 font-medium">
                地图面板尺寸比例
              </label>
              <span className="font-mono text-sky-400">
                {Math.round(settings.previewRatio * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.45"
              step="0.01"
              value={settings.previewRatio}
              onChange={(e) =>
                updateSettings({ previewRatio: parseFloat(e.target.value) })
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>小 (15%)</span>
              <span>默认 (28%)</span>
              <span>大 (45%)</span>
            </div>
          </div>

          {/* 显示屏幕范围 */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <Monitor className="w-3.5 h-3.5 text-neutral-400" />
              多显示器模式
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ scope: "current-screen" })}
                className={`py-2 px-3 rounded-lg border text-center transition cursor-pointer ${
                  settings.scope === "current-screen"
                    ? "border-sky-500 bg-sky-500/20 text-sky-300 font-medium"
                    : "border-white/10 bg-neutral-800 hover:border-white/20 text-neutral-300"
                }`}
              >
                仅当前鼠标所在屏幕
              </button>
              <button
                onClick={() => updateSettings({ scope: "all-screens" })}
                className={`py-2 px-3 rounded-lg border text-center transition cursor-pointer ${
                  settings.scope === "all-screens"
                    ? "border-sky-500 bg-sky-500/20 text-sky-300 font-medium"
                    : "border-white/10 bg-neutral-800 hover:border-white/20 text-neutral-300"
                }`}
              >
                所有活跃显示器
              </button>
            </div>
          </div>

          {/* 窗口标题开关 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/80 border border-white/10">
            <div>
              <p className="font-medium text-white">显示窗口具体标题</p>
              <p className="text-[11px] text-neutral-400">
                开启后可区分同一浏览器的不同网页标签窗口
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showWindowTitles}
              onChange={(e) =>
                updateSettings({ showWindowTitles: e.target.checked })
              }
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          {/* 辅助功能权限状态 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/80 border border-white/10">
            <div className="flex items-center gap-2">
              <Shield
                className={`w-4 h-4 ${
                  isAccessibilityGranted ? "text-emerald-400" : "text-amber-400"
                }`}
              />
              <div>
                <p className="font-medium text-white">辅助功能权限</p>
                <p className="text-[11px] text-neutral-400">
                  {isAccessibilityGranted
                    ? "已授权，可精确执行窗口置顶激活"
                    : "未授权，无法直接激活窗口"}
                </p>
              </div>
            </div>
            {isAccessibilityGranted ? (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                已开启
              </span>
            ) : (
              <button
                onClick={async () => {
                  await openPermissionSettings();
                  await checkPermission();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs cursor-pointer shadow"
              >
                去授权
              </button>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-5 py-3 border-t border-white/10 bg-neutral-850 flex justify-end">
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-medium text-xs transition cursor-pointer shadow"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
