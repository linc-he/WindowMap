import React, { useState, useEffect } from "react";
import { X, Check, Sliders, Keyboard, Shield, Eye, AlertCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { AnchorPosition } from "../types";

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateGlobalShortcut,
    showSettings,
    setShowSettings,
    isAccessibilityGranted,
    openPermissionSettings,
    checkPermission,
  } = useStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [shortcutError, setShortcutError] = useState<string | null>(null);
  const [shortcutSuccess, setShortcutSuccess] = useState(false);

  // 格式化快捷键展示（将 Alt 替换为 Mac 友好的 ⌥ Option，Command 替换为 ⌘ 等）
  const formatDisplayShortcut = (sc: string) => {
    return sc
      .replace(/Alt/g, "⌥ Option")
      .replace(/Option/g, "⌥ Option")
      .replace(/Command/g, "⌘ Cmd")
      .replace(/Cmd/g, "⌘ Cmd")
      .replace(/Control/g, "⌃ Ctrl")
      .replace(/Ctrl/g, "⌃ Ctrl")
      .replace(/Shift/g, "⇧ Shift")
      .replace(/\+/g, " + ");
  };

  // 快捷键捕获监听
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 按 Esc 退出录制
      if (e.key === "Escape") {
        setIsRecording(false);
        setRecordedKeys([]);
        return;
      }

      const parts: string[] = [];
      if (e.metaKey) parts.push("Command");
      if (e.altKey) parts.push("Alt");
      if (e.ctrlKey) parts.push("Control");
      if (e.shiftKey) parts.push("Shift");

      let key = e.key;
      if (key === " ") key = "Space";
      else if (key.length === 1) key = key.toUpperCase();

      // 忽略纯修饰键按下
      if (["Meta", "Alt", "Control", "Shift"].includes(e.key)) {
        setRecordedKeys(parts);
        return;
      }

      parts.push(key);
      setRecordedKeys(parts);

      // 至少包含一个修饰键 + 一个普通键，或者单功能键 (F1-F12, Space)
      const newShortcut = parts.join("+");
      try {
        setShortcutError(null);
        await updateGlobalShortcut(newShortcut);
        setShortcutSuccess(true);
        setTimeout(() => setShortcutSuccess(false), 2000);
      } catch (err: unknown) {
        setShortcutError(String(err));
      } finally {
        setIsRecording(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isRecording, updateGlobalShortcut]);

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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
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
          {/* 全局快捷键录制捕获 */}
          <div className="space-y-1.5 p-3 rounded-xl bg-neutral-800/60 border border-white/10">
            <label className="flex items-center justify-between text-neutral-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-sky-400" />
                全局唤起快捷键
              </span>
              {shortcutSuccess && (
                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> 已保存
                </span>
              )}
            </label>

            <div className="flex items-center gap-2 mt-2">
              <div
                className={`flex-1 px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-center border transition ${
                  isRecording
                    ? "bg-sky-500/20 border-sky-400 text-sky-200 animate-pulse ring-2 ring-sky-400/40"
                    : "bg-neutral-900 border-white/10 text-white font-semibold"
                }`}
              >
                {isRecording
                  ? recordedKeys.length > 0
                    ? recordedKeys.join(" + ")
                    : "正在等待按键... (Esc 取消)"
                  : formatDisplayShortcut(settings.shortcut)}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShortcutError(null);
                  setIsRecording(!isRecording);
                  setRecordedKeys([]);
                }}
                className={`px-3 py-2 rounded-lg font-medium text-xs transition cursor-pointer shrink-0 ${
                  isRecording
                    ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-200"
                    : "bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold shadow-md shadow-sky-500/20"
                }`}
              >
                {isRecording ? "取消" : "点击捕获"}
              </button>
            </div>

            {shortcutError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {shortcutError}
              </p>
            )}

            <p className="text-[11px] text-neutral-400 mt-1">
              点击“点击捕获”后直接在键盘上按下你想要的组合键（例如 Option + Space 或 Cmd + Shift + M）。
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
                      ? "border-sky-500 bg-sky-500/20 text-sky-300 font-semibold"
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
              <span className="font-mono text-sky-400 font-bold">
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

          {/* 台前调度应用开关 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/80 border border-white/10">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <div>
                <p className="font-medium text-white">包含台前调度侧栏应用</p>
                <p className="text-[11px] text-neutral-400">
                  开启后展示台前调度缩略侧栏应用，关闭后仅展示主工作区窗口
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.includeStageManager}
              onChange={(e) =>
                updateSettings({ includeStageManager: e.target.checked })
              }
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
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
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow"
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
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
