import React, { useEffect, useCallback } from "react";
import {
  Settings,
  RefreshCw,
  X,
  Monitor,
  Layers,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Move,
  GripHorizontal,
} from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useStore } from "../store/useStore";
import { WindowBounceDeck } from "./WindowBounceDeck";
import { StageManagerShelf } from "./StageManagerShelf";
import { PermissionGuide } from "./PermissionGuide";
import { SettingsModal } from "./SettingsModal";

export const WindowMapOverlay: React.FC = () => {
  const {
    screens,
    windows,
    stageWindows,
    selectedIndex,
    settings,
    isLoading,
    fetchState,
    setSelectedScreenId,
    getActiveScreen,
    activateWindow,
    activateSelected,
    hideOverlay,
    setSelectedIndex,
    setShowSettings,
    updateSettings,
    navigateDirection,
    navigateNext,
    navigatePrev,
  } = useStore();

  const activeScreen = getActiveScreen();

  const isDarkMode =
    settings.theme === "dark" ||
    (settings.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // 挂载与呼出时获取最新窗口数据
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // 原生窗口顶部拖拽处理器
  const handleHeaderMouseDown = async (e: React.MouseEvent) => {
    // 仅响应鼠标左键拖拽
    if (e.button === 0) {
      try {
        await getCurrentWebviewWindow().startDragging();
      } catch (err) {
        console.error("拖拽窗口异常:", err);
      }
    }
  };

  // 全局键盘快捷键导航与数字键切屏监听
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 数字键 1-9 切换显示器
      if (e.key >= "1" && e.key <= "9") {
        const screenIndex = parseInt(e.key) - 1;
        if (screenIndex < screens.length) {
          e.preventDefault();
          setSelectedScreenId(screens[screenIndex].id);
          return;
        }
      }

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
      screens,
      setSelectedScreenId,
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

  const showStageShelf =
    settings.includeStageManager && stageWindows.length > 0;

  return (
    <div
      onClick={hideOverlay}
      className="w-screen h-screen bg-transparent p-4 flex items-center justify-center select-none"
    >
      {/* 核心毛玻璃面板卡片 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full h-full backdrop-blur-3xl border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 transition-colors ${
          isDarkMode
            ? "bg-neutral-900/90 border-white/20 text-white"
            : "bg-neutral-100/95 border-neutral-300 text-neutral-900 shadow-2xl"
        }`}
      >
        {/* 窗口最顶部专属拖拽区域（按住可平移窗口） */}
        <div
          data-tauri-drag-region
          onMouseDown={handleHeaderMouseDown}
          className={`w-full h-7 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b shrink-0 select-none transition-colors group relative ${
            isDarkMode
              ? "bg-neutral-950/40 hover:bg-neutral-950/70 border-white/5"
              : "bg-neutral-200/40 hover:bg-neutral-200/70 border-neutral-300/50"
          }`}
          title="按住此处可自由拖动窗口位置"
        >
          {/* 左侧提示标识 */}
          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-90 transition-opacity pointer-events-none">
            <Move className="w-3 h-3 text-sky-400" />
            <span
              className={`text-[10px] font-medium tracking-wider ${
                isDarkMode ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              按住拖动窗口
            </span>
          </div>

          {/* 居中原生抓手胶囊条 (Mac 风格拖拽手柄) */}
          <div className="flex items-center gap-1.5 pointer-events-none">
            <div
              className={`w-16 h-1 rounded-full transition-all duration-200 group-hover:w-28 group-hover:h-1.5 flex items-center justify-center ${
                isDarkMode
                  ? "bg-white/20 group-hover:bg-sky-400/70 shadow-xs"
                  : "bg-neutral-400/50 group-hover:bg-sky-500/80 shadow-xs"
              }`}
            />
          </div>

          {/* 右侧微弱提示 */}
          <div className="flex items-center gap-1 opacity-30 group-hover:opacity-75 transition-opacity pointer-events-none text-[10px]">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 顶部标题与拖拽控制栏（按住空白位置亦可原生移动整个窗口） */}
        <div
          data-tauri-drag-region
          onMouseDown={handleHeaderMouseDown}
          className={`flex items-center justify-between px-4 py-3 border-b shrink-0 cursor-grab active:cursor-grabbing select-none ${
            isDarkMode
              ? "border-white/10 bg-neutral-900/50"
              : "border-neutral-200 bg-white/60"
          }`}
        >
          <div
            data-tauri-drag-region
            className="flex items-center gap-2 pointer-events-none"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-xs pointer-events-auto">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="font-bold text-sm tracking-wide">
                WindowMap
              </span>
              <span
                title="按住此处拖动窗口"
                className="opacity-40 hover:opacity-100 transition-opacity"
              >
                <Move className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 多显示器切换 Tab（禁用父级拖拽传播） */}
            {screens.length > 1 && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                className={`flex items-center gap-1.5 ml-2 p-1 rounded-xl border pointer-events-auto ${
                  isDarkMode
                    ? "bg-neutral-950/70 border-white/10"
                    : "bg-neutral-200/70 border-neutral-300"
                }`}
              >
                {screens.map((s, idx) => {
                  const isActive = activeScreen?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScreenId(s.id)}
                      title={`切换到屏幕 ${idx + 1}（快捷键 ${idx + 1}）`}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer font-medium ${
                        isActive
                          ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30"
                          : isDarkMode
                          ? "text-neutral-400 hover:text-white hover:bg-white/10"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-black/5"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>
                        屏幕 {idx + 1}
                        {s.isMain ? " (主)" : ""}
                      </span>
                      <kbd className="text-[10px] opacity-60 font-mono">
                        [{idx + 1}]
                      </kbd>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center gap-2 pointer-events-auto"
          >
            {/* 台前调度应用快速切换折叠开关 */}
            {stageWindows.length > 0 && (
              <button
                onClick={() =>
                  updateSettings({
                    includeStageManager: !settings.includeStageManager,
                  })
                }
                title={
                  settings.includeStageManager
                    ? "隐藏台前调度侧栏"
                    : "展开台前调度侧栏"
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition cursor-pointer ${
                  settings.includeStageManager
                    ? "bg-purple-500/20 border-purple-400/40 text-purple-400 font-medium"
                    : isDarkMode
                    ? "bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200"
                    : "bg-neutral-200 border-neutral-300 text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {settings.includeStageManager ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span>台前调度 ({stageWindows.length})</span>
              </button>
            )}

            {/* 深浅主题快速切换 */}
            <button
              onClick={() =>
                updateSettings({
                  theme: isDarkMode ? "light" : "dark",
                })
              }
              title={`当前主题: ${isDarkMode ? "深色" : "浅色"}，点击切换`}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-amber-300 hover:bg-white/10"
                  : "bg-neutral-200 border-neutral-300 text-amber-600 hover:bg-neutral-300"
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* 刷新 */}
            <button
              onClick={() => fetchState()}
              title="刷新窗口数据"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-white/10 text-neutral-400 hover:text-white"
                  : "hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950"
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isLoading ? "animate-spin text-sky-400" : ""
                }`}
              />
            </button>

            {/* 设置 */}
            <button
              onClick={() => setShowSettings(true)}
              title="偏好设置"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-white/10 text-neutral-400 hover:text-white"
                  : "hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* 关闭 */}
            <button
              onClick={hideOverlay}
              title="关闭 (Esc)"
              className={`p-1.5 rounded-lg transition cursor-pointer ml-1 ${
                isDarkMode
                  ? "hover:bg-white/10 text-neutral-400 hover:text-white"
                  : "hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 权限提示横幅 */}
        <div className="pt-2">
          <PermissionGuide />
        </div>

        {/* 核心工作区：左侧 BounceCards 同比例弹性卡片流 + 右侧 AnimatedList 风格台前调度栏 */}
        <div className="flex-1 p-3 min-h-0 flex items-stretch gap-3 overflow-hidden">
          {activeScreen ? (
            <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden relative rounded-xl border shadow-inner">
              {/* 背景空间点阵参考线 */}
              <div
                className={`absolute inset-0 pointer-events-none ${
                  isDarkMode
                    ? "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-neutral-950/80"
                    : "bg-[radial-gradient(#00000018_1px,transparent_1px)] bg-neutral-200/50"
                } [background-size:24px_24px]`}
              />

              {/* 渲染 BounceCards 同比例规范化卡片组 */}
              {windows.length > 0 ? (
                <WindowBounceDeck
                  windows={windows}
                  selectedIndex={selectedIndex}
                  isDarkMode={isDarkMode}
                  showTitles={settings.showWindowTitles}
                  onSelect={(idx) => setSelectedIndex(idx)}
                  onActivate={(win) => activateWindow(win)}
                />
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center text-neutral-400 p-6">
                  <Monitor className="w-12 h-12 stroke-1 mb-2 text-neutral-500" />
                  <p className="text-sm font-medium">
                    当前屏幕暂无活跃普通应用
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {stageWindows.length > 0
                      ? "应用已收纳在右侧“台前调度”中，点击直接激活"
                      : "点击顶部切换其他显示器"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mb-2" />
              <p className="text-xs">正在探测显示器布局...</p>
            </div>
          )}

          {/* 右侧独立台前调度侧栏（采用 AnimatedList 动效流） */}
          {showStageShelf && (
            <StageManagerShelf
              windows={stageWindows}
              isDarkMode={isDarkMode}
              onActivate={activateWindow}
            />
          )}
        </div>

        {/* 底部快捷键操作指引与窗口计数 */}
        <div
          className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono shrink-0 ${
            isDarkMode
              ? "border-white/10 bg-neutral-950/60 text-neutral-400"
              : "border-neutral-200 bg-neutral-200/50 text-neutral-600"
          }`}
        >
          <div className="flex items-center gap-3 overflow-x-auto py-0.5">
            <span className="whitespace-nowrap">
              <kbd
                className={`px-1.5 py-0.5 rounded ${
                  isDarkMode
                    ? "bg-white/10 text-neutral-200"
                    : "bg-neutral-300 text-neutral-800"
                }`}
              >
                ↑↓←→
              </kbd>{" "}
              卡片切换
            </span>
            <span className="whitespace-nowrap">
              <kbd
                className={`px-1.5 py-0.5 rounded ${
                  isDarkMode
                    ? "bg-white/10 text-neutral-200"
                    : "bg-neutral-300 text-neutral-800"
                }`}
              >
                Enter
              </kbd>{" "}
              激活置顶
            </span>
            <span className="whitespace-nowrap">
              <kbd
                className={`px-1.5 py-0.5 rounded ${
                  isDarkMode
                    ? "bg-white/10 text-neutral-200"
                    : "bg-neutral-300 text-neutral-800"
                }`}
              >
                Tab
              </kbd>{" "}
              循环焦点
            </span>
            {screens.length > 1 && (
              <span className="whitespace-nowrap">
                <kbd
                  className={`px-1.5 py-0.5 rounded ${
                    isDarkMode
                      ? "bg-white/10 text-neutral-200"
                      : "bg-neutral-300 text-neutral-800"
                  }`}
                >
                  1-9
                </kbd>{" "}
                切换屏幕
              </span>
            )}
            <span className="whitespace-nowrap">
              <kbd
                className={`px-1.5 py-0.5 rounded ${
                  isDarkMode
                    ? "bg-white/10 text-neutral-200"
                    : "bg-neutral-300 text-neutral-800"
                }`}
              >
                Esc
              </kbd>{" "}
              退出
            </span>
          </div>

          <div className="whitespace-nowrap ml-2">
            当前应用: {windows.length} 个
            {stageWindows.length > 0 ? ` · 台前: ${stageWindows.length} 个` : ""}
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
