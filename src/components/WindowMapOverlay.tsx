import React, { useEffect, useCallback } from "react";
import { Settings, RefreshCw, X, Monitor, Layers } from "lucide-react";
import { useStore } from "../store/useStore";
import { WindowCard } from "./WindowCard";
import { PermissionGuide } from "./PermissionGuide";
import { SettingsModal } from "./SettingsModal";

export const WindowMapOverlay: React.FC = () => {
  const {
    screens,
    currentScreen,
    windows,
    selectedIndex,
    settings,
    isLoading,
    fetchState,
    activateWindow,
    activateSelected,
    hideOverlay,
    setSelectedIndex,
    setShowSettings,
    navigateDirection,
    navigateNext,
    navigatePrev,
  } = useStore();

  // 挂载与周期性/呼出时获取最新窗口数据
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // 全局键盘快捷键导航监听
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          hideOverlay();
          break;
        case "Enter":
          e.preventDefault();
          activateSelected();
          break;
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            navigatePrev();
          } else {
            navigateNext();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateDirection("right");
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigateDirection("left");
          break;
        case "ArrowDown":
          e.preventDefault();
          navigateDirection("down");
          break;
        case "ArrowUp":
          e.preventDefault();
          navigateDirection("up");
          break;
      }
    },
    [
      hideOverlay,
      activateSelected,
      navigateNext,
      navigatePrev,
      navigateDirection,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 使用当前屏幕计算地图长宽比，没有时默认 16 / 10
  const screenAspect = currentScreen
    ? currentScreen.width / currentScreen.height
    : 16 / 10;

  return (
    <div
      onClick={hideOverlay}
      className="w-screen h-screen bg-transparent p-4 flex items-center justify-center select-none"
    >
      {/* 核心毛玻璃面板卡片 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full max-w-5xl bg-neutral-900/85 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-100"
      >
        {/* 顶部标题与控制栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm tracking-wide text-white">
              WindowMap
            </span>

            {/* 屏幕指示微标 */}
            {screens.length > 1 ? (
              <div className="flex items-center gap-1.5 ml-2">
                {screens.map((s, idx) => (
                  <span
                    key={s.id}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono ${
                      currentScreen?.id === s.id
                        ? "bg-sky-500/30 text-sky-300 border border-sky-400/40"
                        : "bg-white/5 text-neutral-400"
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>屏幕 {idx + 1}{s.isMain ? " (主)" : ""}</span>
                  </span>
                ))}
              </div>
            ) : currentScreen ? (
              <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-white/10 text-[11px] text-neutral-300 font-mono">
                <Monitor className="w-3 h-3 text-neutral-400" />
                <span>
                  {Math.round(currentScreen.width)}×{Math.round(currentScreen.height)}
                  {currentScreen.isMain ? " (主屏)" : ""}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchState()}
              title="刷新窗口数据"
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-400" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title="偏好设置"
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={hideOverlay}
              title="关闭 (Esc)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 权限提示横幅 */}
        <div className="pt-3">
          <PermissionGuide />
        </div>

        {/* 窗口地图画布区域 */}
        <div className="flex-1 p-4 min-h-0 flex items-center justify-center overflow-hidden">
          {currentScreen ? (
            <div
              style={{
                aspectRatio: `${screenAspect}`,
              }}
              className="w-full max-h-full relative rounded-xl border border-white/15 bg-neutral-950/70 shadow-inner overflow-hidden"
            >
              {/* 背景空间点阵参考线 */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

              {/* 渲染所有窗口 */}
              {windows.length > 0 ? (
                windows.map((win, idx) => (
                  <WindowCard
                    key={`${win.windowId}-${win.pid}-${idx}`}
                    window={win}
                    screen={currentScreen}
                    index={idx}
                    isSelected={selectedIndex === idx}
                    showTitles={settings.showWindowTitles}
                    onSelect={() => setSelectedIndex(idx)}
                    onActivate={() => activateWindow(win)}
                  />
                ))
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                  <Monitor className="w-10 h-10 stroke-1 mb-2 text-neutral-600" />
                  <p className="text-sm">当前屏幕未检测到活跃普通窗口</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    点击右上角刷新，或在偏好设置中切换多屏显示模式
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-400">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mb-2" />
              <p className="text-xs">正在探测屏幕与窗口布局...</p>
            </div>
          )}
        </div>

        {/* 底部快捷键操作指引与窗口计数 */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-neutral-950/50 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">
                ↑↓←→
              </kbd>{" "}
              空间定位
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">
                Enter
              </kbd>{" "}
              激活置顶
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">
                Tab
              </kbd>{" "}
              循环切换
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">
                Esc
              </kbd>{" "}
              退出
            </span>
          </div>

          <div className="text-neutral-500">
            {windows.length} 个窗口
            {selectedIndex >= 0 && windows[selectedIndex]
              ? ` · 当前: ${windows[selectedIndex].appName}`
              : ""}
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      <SettingsModal />
    </div>
  );
};
