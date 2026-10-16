import React, { useEffect, useCallback, useMemo, useState } from "react";
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
} from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useStore } from "../store/useStore";
import { WindowCard } from "./WindowCard";
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

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
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
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      try {
        getCurrentWebviewWindow().startDragging();
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

  // BounceCards 空间错落避让与弹发展开引擎（Fan-out Spread Engine）
  const { clusters, stackData, baseZIndexMap } = useMemo(() => {
    const clusterList: number[][] = [];
    const stackInfo = new Map<
      number,
      { stackIndex: number; totalInStack: number; clusterIdx: number }
    >();
    const zIndexMap = new Map<number, number>();

    // 1. 面积反比排序：较小的窗口获得更高的基础层级（baseZIndex），防止大窗口默认遮盖小窗口
    const sortedIndices = windows.map((_, i) => i);
    sortedIndices.sort((a, b) => {
      const areaA = windows[a].width * windows[a].height;
      const areaB = windows[b].width * windows[b].height;
      return areaB - areaA; // 面积大的排在前面（低 zIndex）
    });
    sortedIndices.forEach((winIdx, order) => {
      zIndexMap.set(winIdx, 20 + order * 4);
    });

    // 2. 重叠簇划分（基于几何中心距与矩形交叠）
    windows.forEach((win, idx) => {
      let assignedCluster = -1;
      for (let c = 0; c < clusterList.length; c++) {
        const cluster = clusterList[c];
        const leader = windows[cluster[0]];
        const dist = Math.hypot(win.x - leader.x, win.y - leader.y);

        // 几何相交或中心距离相近即视为同簇
        const isOverlap =
          Math.max(win.x, leader.x) <
            Math.min(win.x + win.width, leader.x + leader.width) &&
          Math.max(win.y, leader.y) <
            Math.min(win.y + win.height, leader.y + leader.height);

        if (dist < 130 || isOverlap) {
          cluster.push(idx);
          assignedCluster = c;
          break;
        }
      }
      if (assignedCluster === -1) {
        clusterList.push([idx]);
      }
    });

    clusterList.forEach((cluster, cIdx) => {
      cluster.forEach((winIdx, orderInCluster) => {
        stackInfo.set(winIdx, {
          stackIndex: orderInCluster,
          totalInStack: cluster.length,
          clusterIdx: cIdx,
        });
      });
    });

    return {
      clusters: clusterList,
      stackData: stackInfo,
      baseZIndexMap: zIndexMap,
    };
  }, [windows]);

  // 计算每个窗口实时的 BounceCards 避让弹发偏移（Push Distance & Fan-out Rotation）
  const getCardPhysics = useCallback(
    (idx: number) => {
      const info = stackData.get(idx);
      if (!info || info.totalInStack <= 1) {
        return { pushX: 0, pushY: 0, rotation: 0 };
      }

      const activeIdx = hoveredIdx !== null ? hoveredIdx : selectedIndex;
      const activeInfo = activeIdx >= 0 ? stackData.get(activeIdx) : null;

      // 仅当当前悬停/选中的窗口与本窗口在同一重叠簇时，触发扇形展开
      if (activeInfo && activeInfo.clusterIdx === info.clusterIdx) {
        const order = info.stackIndex;
        const total = info.totalInStack;

        if (idx === activeIdx) {
          return { pushX: 0, pushY: -8, rotation: 0 };
        }

        // 扇形弹开展开：邻近卡片向外扩散（类似扑克牌展开），露出底层所有大/小窗口
        const mid = (total - 1) / 2;
        const offsetFromMid = order - mid;
        const pushDistance = Math.min(75, 24 + total * 10);

        const angleRad = (offsetFromMid / Math.max(1, total)) * 1.1;
        const pushX = Math.sin(angleRad) * pushDistance * 1.5;
        const pushY = Math.abs(offsetFromMid) * 12 + 4;
        const rotation = offsetFromMid * 3.5; // 轻微旋转产生自然质感

        return { pushX, pushY, rotation };
      }

      // 未被激活时：保持自然的阶梯微旋转
      const order = info.stackIndex;
      const subtleRotate = ((order % 3) - 1) * 1.5;
      return { pushX: 0, pushY: 0, rotation: subtleRotate };
    },
    [stackData, clusters, hoveredIdx, selectedIndex]
  );

  // 当前屏幕长宽比
  const screenAspect = activeScreen
    ? activeScreen.width / activeScreen.height
    : 16 / 10;

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
        {/* 顶部标题与拖拽控制栏（按住空白位置即可原生移动整个窗口） */}
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

        {/* 核心工作区：左侧 BounceCards 避让主画布 + 右侧 AnimatedList 风格台前调度栏 */}
        <div className="flex-1 p-3 min-h-0 flex items-stretch gap-3 overflow-hidden">
          {activeScreen ? (
            <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden">
              <div
                style={{
                  aspectRatio: `${screenAspect}`,
                }}
                className={`w-full max-h-full relative rounded-xl border shadow-inner overflow-hidden ${
                  isDarkMode
                    ? "border-white/15 bg-neutral-950/85"
                    : "border-neutral-300 bg-neutral-200/60"
                }`}
              >
                {/* 背景空间点阵参考线 */}
                <div
                  className={`absolute inset-0 pointer-events-none ${
                    isDarkMode
                      ? "bg-[radial-gradient(#ffffff15_1px,transparent_1px)]"
                      : "bg-[radial-gradient(#00000018_1px,transparent_1px)]"
                  } [background-size:24px_24px]`}
                />

                {/* 渲染所有主工作区窗口（带 BounceCards 避让弹发展开与物理阴影） */}
                {windows.length > 0 ? (
                  windows.map((win, idx) => {
                    const stack = stackData.get(idx) || {
                      stackIndex: 0,
                      totalInStack: 1,
                      clusterIdx: 0,
                    };
                    const baseZ = baseZIndexMap.get(idx) || 20;
                    const physics = getCardPhysics(idx);

                    return (
                      <WindowCard
                        key={`${win.windowId}-${win.pid}-${idx}`}
                        window={win}
                        screen={activeScreen}
                        index={idx}
                        stackIndex={stack.stackIndex}
                        totalInStack={stack.totalInStack}
                        baseZIndex={baseZ}
                        pushX={physics.pushX}
                        pushY={physics.pushY}
                        rotation={physics.rotation}
                        isSelected={selectedIndex === idx}
                        isDarkMode={isDarkMode}
                        showTitles={settings.showWindowTitles}
                        onSelect={() => setSelectedIndex(idx)}
                        onActivate={() => activateWindow(win)}
                        onHoverChange={(isH) => {
                          if (isH) setHoveredIdx(idx);
                          else if (hoveredIdx === idx) setHoveredIdx(null);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                    <Monitor className="w-12 h-12 stroke-1 mb-2 text-neutral-500" />
                    <p className="text-sm font-medium">
                      当前屏幕暂无活跃普通窗口
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {stageWindows.length > 0
                        ? "应用已收纳在右侧“台前调度”中，点击直接激活"
                        : "点击顶部切换其他显示器"}
                    </p>
                  </div>
                )}
              </div>
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
              空间定位
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
              循环切换
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
            主区: {windows.length} 个
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
