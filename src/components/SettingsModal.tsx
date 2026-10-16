import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Sliders,
  Keyboard,
  Shield,
  Eye,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  CheckSquare,
} from "lucide-react";
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

  const isDarkMode =
    settings.theme === "dark" ||
    (settings.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // 格式化快捷键展示
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
        className={`w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDarkMode
            ? "bg-neutral-900 border-white/20 text-neutral-200"
            : "bg-white border-neutral-300 text-neutral-800"
        }`}
      >
        {/* 标题栏 */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDarkMode
              ? "border-white/10 bg-neutral-850"
              : "border-neutral-200 bg-neutral-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-semibold tracking-wide">
              WindowMap 偏好设置
            </h2>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isDarkMode
                ? "hover:bg-white/10 text-neutral-400 hover:text-white"
                : "hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-5 space-y-4 text-xs max-h-[72vh] overflow-y-auto">
          {/* 主题选择卡片 */}
          <div
            className={`p-3 rounded-xl border space-y-2 ${
              isDarkMode
                ? "bg-neutral-800/60 border-white/10"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <label className="font-medium block">外观主题风格</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ theme: "dark" })}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  settings.theme === "dark"
                    ? "border-sky-500 bg-sky-500/20 text-sky-400 font-bold shadow-xs"
                    : isDarkMode
                    ? "border-white/10 bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                    : "border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>深色</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: "light" })}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  settings.theme === "light"
                    ? "border-sky-500 bg-sky-500/20 text-sky-500 font-bold shadow-xs"
                    : isDarkMode
                    ? "border-white/10 bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                    : "border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>浅色</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: "system" })}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  settings.theme === "system"
                    ? "border-sky-500 bg-sky-500/20 text-sky-400 font-bold shadow-xs"
                    : isDarkMode
                    ? "border-white/10 bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                    : "border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>跟随系统</span>
              </button>
            </div>
          </div>

          {/* 全局快捷键录制捕获 */}
          <div
            className={`space-y-1.5 p-3 rounded-xl border ${
              isDarkMode
                ? "bg-neutral-800/60 border-white/10"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <label className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-sky-400" />
                全局唤起快捷键
              </span>
              {shortcutSuccess && (
                <span className="text-emerald-500 text-[11px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> 已保存
                </span>
              )}
            </label>

            <div className="flex items-center gap-2 mt-2">
              <div
                className={`flex-1 px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-center border transition ${
                  isRecording
                    ? "bg-sky-500/20 border-sky-400 text-sky-300 animate-pulse ring-2 ring-sky-400/40"
                    : isDarkMode
                    ? "bg-neutral-900 border-white/10 text-white font-semibold"
                    : "bg-white border-neutral-300 text-neutral-900 font-semibold"
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
              <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {shortcutError}
              </p>
            )}

            <p className="text-[11px] opacity-70 mt-1">
              点击“点击捕获”后直接在键盘上按下你想要的组合键（例如 Option + Space 或 Cmd + Shift + M）。
            </p>
          </div>

          {/* 预览大小比例（实时动态生效） */}
          <div
            className={`space-y-1.5 p-3 rounded-xl border ${
              isDarkMode
                ? "bg-neutral-800/60 border-white/10"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <label className="font-medium">
                地图面板尺寸比例 (拖动实时缩放)
              </label>
              <span className="font-mono text-sky-500 font-bold text-sm">
                {Math.round(settings.previewRatio * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.85"
              step="0.01"
              value={settings.previewRatio}
              onChange={(e) =>
                updateSettings({ previewRatio: parseFloat(e.target.value) })
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] opacity-60">
              <span>紧凑 (25%)</span>
              <span>默认推荐 (55%)</span>
              <span>沉浸式 (85%)</span>
            </div>
          </div>

          {/* 预览锚点位置 */}
          <div className="space-y-1.5">
            <label className="font-medium block">浮层弹出锚点</label>
            <div className="grid grid-cols-3 gap-2">
              {anchors.map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateSettings({ anchor: item.id })}
                  className={`py-2 px-3 rounded-lg border text-center transition cursor-pointer ${
                    settings.anchor === item.id
                      ? "border-sky-500 bg-sky-500/20 text-sky-400 font-semibold"
                      : isDarkMode
                      ? "border-white/10 bg-neutral-800 hover:border-white/20 text-neutral-300"
                      : "border-neutral-300 bg-white hover:border-neutral-400 text-neutral-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 点击激活后是否关闭 WindowMap */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isDarkMode
                ? "bg-neutral-800/80 border-white/10"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="font-medium">激活应用后关闭 WindowMap</p>
                <p className="text-[11px] opacity-70">
                  开启后点击激活应用自动关闭地图；关闭后保持地图浮层置顶
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.closeOnActivate}
              onChange={(e) =>
                updateSettings({ closeOnActivate: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* 台前调度应用开关 */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isDarkMode
                ? "bg-neutral-800/80 border-white/10"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="font-medium">包含台前调度侧栏应用</p>
                <p className="text-[11px] opacity-70">
                  开启后在右侧独立抽屉栏展示台前调度应用并支持悬浮预览
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
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isDarkMode
                ? "bg-neutral-800/80 border-white/10"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div>
              <p className="font-medium">显示窗口具体标题</p>
              <p className="text-[11px] opacity-70">
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
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isDarkMode
                ? "bg-neutral-800/80 border-white/10"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield
                className={`w-4 h-4 ${
                  isAccessibilityGranted ? "text-emerald-500" : "text-amber-500"
                }`}
              />
              <div>
                <p className="font-medium">辅助功能权限</p>
                <p className="text-[11px] opacity-70">
                  {isAccessibilityGranted
                    ? "已授权，可精确执行窗口置顶激活"
                    : "未授权，无法直接激活窗口"}
                </p>
              </div>
            </div>
            {isAccessibilityGranted ? (
              <span className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                已开启
              </span>
            ) : (
              <button
                onClick={async () => {
                  await openPermissionSettings();
                  await checkPermission();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-xs"
              >
                去授权
              </button>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div
          className={`px-5 py-3 border-t flex justify-end ${
            isDarkMode
              ? "border-white/10 bg-neutral-850"
              : "border-neutral-200 bg-neutral-100"
          }`}
        >
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-xs"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
