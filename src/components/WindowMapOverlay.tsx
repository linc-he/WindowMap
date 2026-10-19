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
  LayoutGrid,
} from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useStore } from "../store/useStore";
import { OverviewCanvas } from "./OverviewCanvas";
import { WindowBounceDeck } from "./WindowBounceDeck";
import { StageManagerShelf } from "./StageManagerShelf";
import { PermissionGuide } from "./PermissionGuide";
import { SettingsModal } from "./SettingsModal";

export const WindowMapOverlay: React.FC = () => {
  const {
    viewMode,
    screens,
    windows,
    stageWindows,
    allWindows,
    selectedIndex,
    settings,
    isLoading,
    fetchState,
    setViewMode,
    setSelectedScreenId,
    getActiveScreen,
    getWindowsForScreen,
    getAllStageWindowsGrouped,
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

  // 挂载、窗口被呼出打开、获得焦点时自动获取最新应用及台前调度数据
  useEffect(() => {
    // 首次挂载初始化
    fetchState({ isOverlayOpen: true });

    const currentWindow = getCurrentWebviewWindow();

    // 1. 监听 Rust 端发出的 overlay-opened 事件（快捷键呼出、托盘点击唤起等）
    const unlistenOverlayPromise = currentWindow.listen("overlay-opened", () => {
      fetchState({ isOverlayOpen: true });
    });

    // 2. 监听窗口获得焦点事件（窗口从隐藏变为显示并激活）
    const unlistenFocusPromise = currentWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        fetchState({ isOverlayOpen: true });
      }
    });

    // 3. 监听 Web 窗口 focus 事件作为兜底保障
    const handleFocus = () => {
      fetchState({ isOverlayOpen: true });
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      unlistenOverlayPromise.then((unlisten) => unlisten());
      unlistenFocusPromise.then((unlisten) => unlisten());
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchState]);

  // 原生窗口最顶部专属拖拽处理器
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

  // 全局键盘快捷键导航、0 概览与数字键 1-9 单屏监听
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 快捷键 0 切换到概览模式
      if (e.key === "0") {
        e.preventDefault();
        setViewMode("overview");
        return;
      }

      // 数字键 1-9 切换对应显示器单屏
      if (e.key >= "1" && e.key <= "9") {
        const screenIndex = parseInt(e.key) - 1;
        if (screenIndex < screens.length) {
          e.preventDefault();
          setSelectedScreenId(screens[screenIndex].id);
          setViewMode("single");
          return;
        }
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          hideOverlay();
          break;
        case "Enter":
          if (viewMode === "single") {
            e.preventDefault();
            activateSelected();
          }
          break;
        case "Tab":
          if (viewMode === "single") {
            e.preventDefault();
            if (e.shiftKey) {
              navigatePrev();
            } else {
              navigateNext();
            }
          }
          break;
        case "ArrowRight":
          if (viewMode === "single") {
            e.preventDefault();
            navigateDirection("right");
          }
          break;
        case "ArrowLeft":
          if (viewMode === "single") {
            e.preventDefault();
            navigateDirection("left");
          }
          break;
        case "ArrowDown":
          if (viewMode === "single") {
            e.preventDefault();
            navigateDirection("down");
          }
          break;
        case "ArrowUp":
          if (viewMode === "single") {
            e.preventDefault();
            navigateDirection("up");
          }
          break;
      }
    },
    [
      screens,
      viewMode,
      setViewMode,
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

  // 台前调度侧栏统计
  const allStageGroups = getAllStageWindowsGrouped();
  const totalStageCount = allStageGroups.reduce(
    (acc, g) => acc + g.windows.length,
    0
  );
  const currentStageCount =
    viewMode === "overview" ? totalStageCount : stageWindows.length;
  const showStageShelf =
    settings.includeStageManager && currentStageCount > 0;

  // 总普通活跃应用计数
  const totalMainCount = allWindows.filter(
    (w) =>
      !w.isStageManager &&
      w.appName &&
      !w.appName.toLowerCase().includes("windowmanager")
  ).length;

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
        {/* 窗口最顶部专属拖拽区域（按住可平移整个窗口） */}
        <div
          data-tauri-drag-region
          onMouseDown={handleHeaderMouseDown}
          className={`w-full h-7 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b shrink-0 select-none transition-colors group relative ${
            isDarkMode
              ? "bg-neutral-950/40 hover:bg-neutral-950/70 border-white/5"
              : "bg-neutral-200/40 hover:bg-neutral-200/70 border-neutral-300/50"
          }`}
          title="按住此处可自由拖动浮层窗口位置"
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

          {/* 右侧提示 */}
          <div className="flex items-center gap-1 opacity-30 group-hover:opacity-75 transition-opacity pointer-events-none text-[10px]">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 顶部标题与视图模式导航栏 */}
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

            {/* 核心视图切换 Tab 组：【概览模式】+ 各屏幕单屏切换 */}
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className={`flex items-center gap-1 ml-3 p-1 rounded-xl border pointer-events-auto ${
                isDarkMode
                  ? "bg-neutral-950/70 border-white/10"
                  : "bg-neutral-200/70 border-neutral-300"
              }`}
            >
              {/* 概览模式 Tab */}
              <button
                onClick={() => setViewMode("overview")}
                title="概览模式：查看与拖拽所有屏幕布局（快捷键 0）"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer font-medium ${
                  viewMode === "overview"
                    ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30"
                    : isDarkMode
                    ? "text-neutral-400 hover:text-white hover:bg-white/10"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-black/5"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>概览模式</span>
                <kbd className="text-[10px] opacity-60 font-mono">[0]</kbd>
              </button>

              {/* 各屏幕快速单屏聚焦 Tab */}
              {screens.map((s, idx) => {
                const isActive =
                  viewMode === "single" && activeScreen?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedScreenId(s.id);
                      setViewMode("single");
                    }}
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
          </div>

          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center gap-2 pointer-events-auto"
          >
            {/* 台前调度应用快速切换折叠开关 */}
            {currentStageCount > 0 && (
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
                <span>
                  台前调度 (
                  {viewMode === "overview" ? "全屏 " : ""}
                  {currentStageCount})
                </span>
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
              onClick={() => fetchState({ force: true })}
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

        {/* 核心工作区：概览模式画布 / 单屏 BounceCards + 右侧台前调度侧栏 */}
        <div className="flex-1 p-3 min-h-0 flex items-stretch gap-3 overflow-hidden">
          {viewMode === "overview" ? (
            /* 概览模式：所有屏幕的大卡片自由拖动布局，内嵌 CardSwap 小卡片 */
            <OverviewCanvas
              screens={screens}
              allWindows={allWindows}
              isDarkMode={isDarkMode}
              showTitles={settings.showWindowTitles}
              getWindowsForScreen={getWindowsForScreen}
              onFocusScreen={(screenId) => {
                setSelectedScreenId(screenId);
                setViewMode("single");
              }}
              onActivateWindow={activateWindow}
            />
          ) : activeScreen ? (
            /* 单屏模式：当前选中屏幕应用 BounceCards 弹性卡片流 */
            <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden relative rounded-xl border shadow-inner">
              {/* 背景空间点阵参考线 */}
              <div
                className={`absolute inset-0 pointer-events-none ${
                  isDarkMode
                    ? "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-neutral-950/80"
                    : "bg-[radial-gradient(#00000018_1px,transparent_1px)] bg-neutral-200/50"
                } [background-size:24px_24px]`}
              />

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
                      : "点击顶部切换其他显示器或返回概览模式"}
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

          {/* 右侧台前调度侧栏：概览模式展示全屏分组，单屏模式展示当前屏 */}
          {showStageShelf && (
            <StageManagerShelf
              windows={viewMode === "single" ? stageWindows : undefined}
              screenGroups={
                viewMode === "overview" ? allStageGroups : undefined
              }
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
                0
              </kbd>{" "}
              概览模式
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
                单屏聚焦
              </span>
            )}
            {viewMode === "single" && (
              <>
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
              </>
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
            {viewMode === "overview" ? (
              <span>
                显示器: {screens.length} 台 · 活跃应用: {totalMainCount} 个
                {totalStageCount > 0 ? ` · 全屏台前: ${totalStageCount} 个` : ""}
              </span>
            ) : (
              <span>
                当前屏应用: {windows.length} 个
                {stageWindows.length > 0 ? ` · 台前: ${stageWindows.length} 个` : ""}
                {selectedIndex >= 0 && windows[selectedIndex]
                  ? ` · 当前: ${windows[selectedIndex].appName}`
                  : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      <SettingsModal />
    </div>
  );
};
