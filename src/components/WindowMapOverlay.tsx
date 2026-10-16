import React, { useEffect, useCallback, useMemo } from "react";
import { Settings, RefreshCw, X, Monitor, Layers, Eye, EyeOff } from "lucide-react";
import { useStore } from "../store/useStore";
import { WindowCard } from "./WindowCard";
import { PermissionGuide } from "./PermissionGuide";
import { SettingsModal } from "./SettingsModal";

export const WindowMapOverlay: React.FC = () => {
  const {
    screens,
    windows,
    allWindows,
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

  // 挂载与呼出时获取最新窗口数据
  useEffect(() => {
    fetchState();
  }, [fetchState]);

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

  // 计算窗口重叠群组与错落位移层级
  const windowStackData = useMemo(() => {
    const stackInfo = new Map<
      number,
      { stackIndex: number; totalInStack: number }
    >();
    const clusters: number[][] = [];

    windows.forEach((win, idx) => {
      let added = false;
      for (const cluster of clusters) {
        const leader = windows[cluster[0]];
        const dist = Math.hypot(win.x - leader.x, win.y - leader.y);
        if (dist < 90) {
          cluster.push(idx);
          added = true;
          break;
        }
      }
      if (!added) {
        clusters.push([idx]);
      }
    });

    clusters.forEach((cluster) => {
      cluster.forEach((winIdx, orderInCluster) => {
        stackInfo.set(winIdx, {
          stackIndex: orderInCluster,
          totalInStack: cluster.length,
        });
      });
    });

    return stackInfo;
  }, [windows]);

  // 统计当前屏幕上台前调度应用数量
  const stageManagerCount = useMemo(() => {
    if (!activeScreen) return 0;
    return allWindows.filter(
      (w) =>
        w.isStageManager &&
        (w.screenId === activeScreen.id ||
          (w.x >= activeScreen.x &&
            w.x < activeScreen.x + activeScreen.width &&
            w.y >= activeScreen.y &&
            w.y < activeScreen.y + activeScreen.height))
    ).length;
  }, [allWindows, activeScreen]);

  // 当前屏幕长宽比
  const screenAspect = activeScreen
    ? activeScreen.width / activeScreen.height
    : 16 / 10;

  return (
    <div
      onClick={hideOverlay}
      className="w-screen h-screen bg-transparent p-4 flex items-center justify-center select-none"
    >
      {/* 核心毛玻璃面板卡片 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full max-w-5xl bg-neutral-900/90 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-150"
      >
        {/* 顶部标题与控制栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wide text-white">
              WindowMap
            </span>

            {/* 多显示器切换 Tab 选项卡（支持鼠标直接点击与键盘数字键 1/2/3 切换） */}
            {screens.length > 1 && (
              <div className="flex items-center gap-1.5 ml-2 bg-neutral-950/70 p-1 rounded-xl border border-white/10">
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
                          : "text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>屏幕 {idx + 1}{s.isMain ? " (主)" : ""}</span>
                      <kbd className="text-[10px] opacity-60 font-mono">[{idx + 1}]</kbd>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 台前调度侧栏应用显示/隐藏快速切换 */}
            {stageManagerCount > 0 && (
              <button
                onClick={() =>
                  updateSettings({
                    includeStageManager: !settings.includeStageManager,
                  })
                }
                title={
                  settings.includeStageManager
                    ? "隐藏台前调度侧栏应用"
                    : "展开台前调度侧栏应用"
                }
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition cursor-pointer ${
                  settings.includeStageManager
                    ? "bg-purple-500/20 border-purple-400/40 text-purple-300"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {settings.includeStageManager ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span>台前调度 ({stageManagerCount})</span>
              </button>
            )}

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
          {activeScreen ? (
            <div
              style={{
                aspectRatio: `${screenAspect}`,
              }}
              className="w-full max-h-full relative rounded-xl border border-white/15 bg-neutral-950/80 shadow-inner overflow-hidden"
            >
              {/* 背景空间点阵参考线 */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

              {/* 渲染所有窗口 */}
              {windows.length > 0 ? (
                windows.map((win, idx) => {
                  const stackData = windowStackData.get(idx) || {
                    stackIndex: 0,
                    totalInStack: 1,
                  };
                  return (
                    <WindowCard
                      key={`${win.windowId}-${win.pid}-${idx}`}
                      window={win}
                      screen={activeScreen}
                      index={idx}
                      stackIndex={stackData.stackIndex}
                      totalInStack={stackData.totalInStack}
                      isSelected={selectedIndex === idx}
                      showTitles={settings.showWindowTitles}
                      onSelect={() => setSelectedIndex(idx)}
                      onActivate={() => activateWindow(win)}
                    />
                  );
                })
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                  <Monitor className="w-12 h-12 stroke-1 mb-2 text-neutral-600" />
                  <p className="text-sm font-medium">该屏幕暂无普通活跃窗口</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    点击顶部切换其他显示器，或在右上角开启“台前调度”
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-400">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mb-2" />
              <p className="text-xs">正在探测显示器布局...</p>
            </div>
          )}
        </div>

        {/* 底部快捷键操作指引与窗口计数 */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
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
            {screens.length > 1 && (
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">
                  1-9
                </kbd>{" "}
                切换屏幕
              </span>
            )}
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">
                Esc
              </kbd>{" "}
              退出
            </span>
          </div>

          <div className="text-neutral-400">
            {windows.length} 个窗口
            {selectedIndex >= 0 && windows[selectedIndex]
              ? ` · 当前选中: ${windows[selectedIndex].appName}`
              : ""}
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      <SettingsModal />
    </div>
  );
};
