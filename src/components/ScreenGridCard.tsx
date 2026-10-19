import React from "react";
import { Monitor, GripHorizontal, Maximize2 } from "lucide-react";
import { ScreenInfo, WindowInfo } from "../types";
import { CardSwapDeck } from "./CardSwapDeck";

interface Props {
  screen: ScreenInfo;
  screenIndex: number;
  windows: WindowInfo[];
  position: { x: number; y: number };
  isDragging: boolean;
  isDarkMode: boolean;
  showTitles: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onFocusScreen: (screenId: number) => void;
  onActivateWindow: (win: WindowInfo) => void;
}

export const ScreenGridCard: React.FC<Props> = ({
  screen,
  screenIndex,
  windows,
  position,
  isDragging,
  isDarkMode,
  showTitles,
  onDragStart,
  onFocusScreen,
  onActivateWindow,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "390px",
        height: "275px",
        zIndex: isDragging ? 50 : 10,
        boxShadow: isDragging
          ? "0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 20px 2px rgba(56, 189, 248, 0.35)"
          : isDarkMode
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.08)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 1px 1px rgba(0, 0, 0, 0.08)",
        transition: isDragging
          ? "box-shadow 0.15s ease"
          : "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      className={`rounded-2xl border backdrop-blur-2xl flex flex-col overflow-hidden select-none will-change-transform ${
        isDragging
          ? "ring-2 ring-sky-400 border-sky-400"
          : isDarkMode
          ? "bg-neutral-900/85 border-white/10 hover:border-white/20"
          : "bg-white/90 border-neutral-200/90 hover:border-neutral-300"
      }`}
    >
      {/* 顶部专属拖拽标头 (按住可任意平移布局) */}
      <div
        onMouseDown={onDragStart}
        className={`w-full h-9 px-3 flex items-center justify-between border-b shrink-0 cursor-grab active:cursor-grabbing transition-colors group ${
          isDragging
            ? isDarkMode
              ? "bg-sky-500/20 border-sky-400/30"
              : "bg-sky-100 border-sky-300"
            : isDarkMode
            ? "bg-neutral-950/50 hover:bg-neutral-950/80 border-white/5"
            : "bg-neutral-100/70 hover:bg-neutral-200/70 border-neutral-200"
        }`}
        title="按住此处可自由拖动屏幕卡片位置"
      >
        {/* 左侧：屏幕图标与名称 */}
        <div className="flex items-center gap-2 pointer-events-none min-w-0">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
              screen.isMain
                ? "bg-sky-500/20 text-sky-400"
                : isDarkMode
                ? "bg-white/10 text-neutral-300"
                : "bg-neutral-200 text-neutral-700"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-xs font-bold truncate ${
                isDarkMode ? "text-white" : "text-neutral-900"
              }`}
            >
              屏幕 {screenIndex + 1}
              {screen.isMain && (
                <span className="ml-1 text-[10px] text-sky-400 font-normal">
                  (主)
                </span>
              )}
            </span>

            <span
              className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                isDarkMode
                  ? "bg-black/40 border-white/5 text-neutral-400"
                  : "bg-white/80 border-neutral-300 text-neutral-600"
              }`}
            >
              {Math.round(screen.width)}×{Math.round(screen.height)}
            </span>
          </div>
        </div>

        {/* 右侧：拖拽指示手柄与进入单屏聚焦按钮 */}
        <div className="flex items-center gap-1.5">
          {/* 应用数量徽章 */}
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-medium ${
              windows.length > 0
                ? isDarkMode
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                  : "bg-sky-100 text-sky-700 border border-sky-300"
                : isDarkMode
                ? "bg-white/5 text-neutral-500"
                : "bg-neutral-200 text-neutral-500"
            }`}
          >
            {windows.length} 应用
          </span>

          {/* 拖拽微把手 */}
          <div
            className="flex items-center opacity-30 group-hover:opacity-80 transition-opacity pointer-events-none"
            title="按住拖拽"
          >
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>

          {/* 进入单屏视图快捷按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFocusScreen(screen.id);
            }}
            title="聚焦进入此屏幕单屏模式"
            className={`p-1 rounded transition cursor-pointer ${
              isDarkMode
                ? "text-neutral-400 hover:text-white hover:bg-white/10"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-black/5"
            }`}
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 卡片下半部：CardSwap 3D 卡片栈展示区域 */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center p-2">
        <CardSwapDeck
          windows={windows}
          isDarkMode={isDarkMode}
          showTitles={showTitles}
          onActivate={onActivateWindow}
        />
      </div>
    </div>
  );
};
