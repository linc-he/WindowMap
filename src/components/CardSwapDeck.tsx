import React, { useState } from "react";
import { WindowInfo } from "../types";
import { WindowCard } from "./WindowCard";
import { Monitor, ChevronLeft, ChevronRight, Layers } from "lucide-react";

interface Props {
  windows: WindowInfo[];
  isDarkMode: boolean;
  showTitles: boolean;
  onActivate: (win: WindowInfo) => void;
}

export const CardSwapDeck: React.FC<Props> = ({
  windows,
  isDarkMode,
  showTitles,
  onActivate,
}) => {
  // 维护 3D 卡片栈的轮转顺序 (0 是最顶层/最前端卡片)
  const [order, setOrder] = useState<number[]>(() =>
    windows.map((_, i) => i)
  );
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);

  // 当外部 windows 列表变动时重置顺序
  React.useEffect(() => {
    setOrder(windows.map((_, i) => i));
  }, [windows.length]);

  const count = windows.length;

  // 轮转到下一张（前卡置底）
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count <= 1) return;
    setOrder((prev) => [...prev.slice(1), prev[0]]);
  };

  // 轮转到上一张（底卡置顶）
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count <= 1) return;
    setOrder((prev) => [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)]);
  };

  if (count === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-4">
        <Monitor className="w-8 h-8 stroke-1 mb-1.5 opacity-40" />
        <span className="text-xs font-medium opacity-60">当前屏幕无活跃应用</span>
      </div>
    );
  }

  if (count === 1) {
    const win = windows[0];
    return (
      <div className="w-full h-full flex items-center justify-center p-3">
        <div className="transition-transform duration-200 hover:scale-[1.04]">
          <WindowCard
            window={win}
            index={0}
            isSelected={false}
            isHovered={hoveredPos === 0}
            isDarkMode={isDarkMode}
            showTitles={showTitles}
            compact={true}
            onSelect={() => {}}
            onActivate={() => onActivate(win)}
            onMouseEnter={() => setHoveredPos(0)}
            onMouseLeave={() => setHoveredPos(null)}
          />
        </div>
      </div>
    );
  }

  // 多卡片采用 React Bits CardSwap 3D 深度堆叠视效
  // 控制最多可视渲染前 5 张卡片，保证性能与优雅视觉
  const maxVisible = 5;

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden p-2 select-none">
      {/* 3D 透视舞台容器 */}
      <div
        style={{
          perspective: "900px",
          transformStyle: "preserve-3d",
        }}
        className="relative w-[280px] h-[180px] flex items-center justify-center"
      >
        {order.map((winIdx, pos) => {
          if (pos >= maxVisible) return null;
          const win = windows[winIdx];
          if (!win) return null;

          const isHovered = hoveredPos === pos;
          const isFront = pos === 0;

          // 核心 CardSwap 堆叠参数（依据位置 pos 逐步向右上偏移并压暗）
          const spread = hoveredPos !== null ? 1.15 : 1.0;
          const dx = pos * 24 * spread;
          const dy = -pos * 14 * spread;
          const dz = -pos * 28;
          const skewY = isHovered ? 0 : 2.5;
          const rotate = isHovered ? 0 : -pos * 0.8;
          const liftY = isHovered ? -12 : 0;
          const scale = isHovered ? 1.05 : 1.0;

          // 层级与透明度淡出
          const zIndex = isHovered ? 60 : 30 - pos;
          const opacity = isHovered ? 1 : Math.max(0.48, 1 - pos * 0.12);

          return (
            <div
              key={`${win.windowId}-${win.pid}-${winIdx}`}
              style={{
                position: "absolute",
                transform: `translate3d(${dx}px, ${dy + liftY}px, ${dz}px) rotate(${rotate}deg) skewY(${skewY}deg) scale(${scale})`,
                zIndex,
                opacity,
                transition:
                  "transform 0.32s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.22s ease, z-index 0.1s ease",
              }}
              className="cursor-pointer will-change-transform"
            >
              <WindowCard
                window={win}
                index={winIdx}
                isSelected={isFront && hoveredPos === null}
                isHovered={isHovered}
                isDarkMode={isDarkMode}
                showTitles={showTitles}
                compact={true}
                onSelect={() => {}}
                onActivate={() => onActivate(win)}
                onMouseEnter={() => setHoveredPos(pos)}
                onMouseLeave={() => setHoveredPos(null)}
              />
            </div>
          );
        })}
      </div>

      {/* 底部微型翻卡指示器与翻转控制（当超过 1 个应用时提供） */}
      {count > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border backdrop-blur-md z-40 transition-opacity ${
            isDarkMode
              ? "bg-neutral-900/80 border-white/10 text-neutral-300"
              : "bg-white/80 border-neutral-300 text-neutral-700 shadow-xs"
          }`}
        >
          <button
            onClick={handlePrev}
            title="查看上一张卡片"
            className="p-0.5 rounded hover:bg-white/20 transition cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-1 px-1">
            <Layers className="w-3 h-3 text-sky-400" />
            <span>
              {order[0] + 1} / {count}
            </span>
          </div>

          <button
            onClick={handleNext}
            title="轮转下一张卡片 (CardSwap)"
            className="p-0.5 rounded hover:bg-white/20 transition cursor-pointer"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
