import React, { useState, useEffect, useRef, useCallback } from "react";
import { ScreenInfo, WindowInfo } from "../types";
import { ScreenGridCard } from "./ScreenGridCard";
import { RotateCcw } from "lucide-react";

interface Props {
  screens: ScreenInfo[];
  allWindows: WindowInfo[];
  isDarkMode: boolean;
  showTitles: boolean;
  getWindowsForScreen: (screenId: number) => {
    main: WindowInfo[];
    stage: WindowInfo[];
  };
  onFocusScreen: (screenId: number) => void;
  onActivateWindow: (win: WindowInfo) => void;
}

const STORAGE_KEY = "windowmap_overview_positions";

export const OverviewCanvas: React.FC<Props> = ({
  screens,
  isDarkMode,
  showTitles,
  getWindowsForScreen,
  onFocusScreen,
  onActivateWindow,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 维护每个屏幕大卡片的左上角坐标
  const [positions, setPositions] = useState<{
    [screenId: number]: { x: number; y: number };
  }>({});

  const [draggingScreenId, setDraggingScreenId] = useState<number | null>(null);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ startX: 0, startY: 0, origX: 0, origY: 0 });

  // 计算标准默认自适应网格排版
  const calculateDefaultPositions = useCallback(() => {
    const defaultPos: { [screenId: number]: { x: number; y: number } } = {};
    const cardW = 390;
    const cardH = 275;
    const gapX = 30;
    const gapY = 24;
    const startX = 28;
    const startY = 24;

    const count = screens.length;
    // 每行排 2 个大卡片
    const cols = count > 1 ? 2 : 1;

    screens.forEach((screen, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      defaultPos[screen.id] = {
        x: startX + col * (cardW + gapX),
        y: startY + row * (cardH + gapY),
      };
    });

    return defaultPos;
  }, [screens]);

  // 初始化与持久化恢复位置
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // 校验保存的位置是否覆盖所有当前屏幕
        const hasAll = screens.every((s) => saved[s.id] !== undefined);
        if (hasAll) {
          setPositions(saved);
          return;
        }
      }
    } catch (e) {
      console.warn("加载保存的屏幕布局失败:", e);
    }

    // 默认排版
    setPositions(calculateDefaultPositions());
  }, [screens, calculateDefaultPositions]);

  // 重置位置
  const handleResetPositions = () => {
    const defaults = calculateDefaultPositions();
    setPositions(defaults);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 鼠标在某个卡片顶部按住开始拖拽
  const handleDragStart = (screenId: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // 阻止冒泡，避免触发外层原生窗口拖拽
    e.stopPropagation();

    const currentPos = positions[screenId] || { x: 30, y: 30 };
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: currentPos.x,
      origY: currentPos.y,
    };
    setDraggingScreenId(screenId);
  };

  // 全局鼠标移动与松开事件监听
  useEffect(() => {
    if (draggingScreenId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const container = containerRef.current;
      const maxX = container ? Math.max(100, container.clientWidth - 120) : 2000;
      const maxY = container ? Math.max(100, container.clientHeight - 80) : 2000;

      const nextX = Math.max(10, Math.min(maxX, dragStartRef.current.origX + deltaX));
      const nextY = Math.max(10, Math.min(maxY, dragStartRef.current.origY + deltaY));

      setPositions((prev) => ({
        ...prev,
        [draggingScreenId]: { x: nextX, y: nextY },
      }));
    };

    const handleMouseUp = () => {
      setDraggingScreenId(null);
      // 持久化保存
      setPositions((latest) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(latest));
        } catch (err) {
          console.error("保存屏幕布局出错:", err);
        }
        return latest;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingScreenId]);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full relative overflow-auto rounded-xl border shadow-inner select-none"
    >
      {/* 空间点阵参考背景 */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDarkMode
            ? "bg-[radial-gradient(#ffffff18_1.2px,transparent_1.2px)] bg-neutral-950/80"
            : "bg-[radial-gradient(#00000015_1.2px,transparent_1.2px)] bg-neutral-200/40"
        } [background-size:24px_24px]`}
      />

      {/* 右上角快捷辅助浮钮：重置屏幕布局 */}
      <div className="absolute top-3 right-3 z-30">
        <button
          onClick={handleResetPositions}
          title="重置屏幕卡片为整齐默认排列"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border backdrop-blur-md transition shadow-xs cursor-pointer ${
            isDarkMode
              ? "bg-neutral-900/80 border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-800"
              : "bg-white/80 border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>重置布局</span>
        </button>
      </div>

      {/* 渲染所有屏幕的大卡片（每个可自由拖动） */}
      {screens.map((screen, idx) => {
        const { main } = getWindowsForScreen(screen.id);
        const pos = positions[screen.id] || {
          x: 28 + idx * 420,
          y: 24,
        };

        return (
          <ScreenGridCard
            key={screen.id}
            screen={screen}
            screenIndex={idx}
            windows={main}
            position={pos}
            isDragging={draggingScreenId === screen.id}
            isDarkMode={isDarkMode}
            showTitles={showTitles}
            onDragStart={(e) => handleDragStart(screen.id, e)}
            onFocusScreen={onFocusScreen}
            onActivateWindow={onActivateWindow}
          />
        );
      })}
    </div>
  );
};
