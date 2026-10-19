import React, { useState, useMemo } from "react";
import { WindowInfo } from "../types";
import { WindowCard } from "./WindowCard";
import { Monitor } from "lucide-react";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const count = windows.length;

  // 预设与单屏一致的自然微错落倾斜角度
  const baseRotations = useMemo(() => {
    const rots = [-3.0, 2.5, -2.0, 3.0, -1.8, 2.2, -2.8, 1.6];
    return windows.map((_, i) => rots[i % rots.length]);
  }, [windows]);

  if (count === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-4">
        <Monitor className="w-8 h-8 stroke-1 mb-1.5 opacity-40" />
        <span className="text-xs font-medium opacity-60">当前屏幕暂无活跃应用</span>
      </div>
    );
  }

  if (count === 1) {
    const win = windows[0];
    const isHovered = hoveredIndex === 0;
    return (
      <div className="w-full h-full flex items-center justify-center p-3">
        <div
          style={{
            transform: isHovered ? "scale(1.08) translateY(-6px)" : "scale(1)",
            transition: "transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1)",
          }}
        >
          <WindowCard
            window={win}
            index={0}
            isSelected={isHovered}
            isHovered={isHovered}
            isDarkMode={isDarkMode}
            showTitles={showTitles}
            mini={true}
            onSelect={() => {}}
            onActivate={() => onActivate(win)}
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        </div>
      </div>
    );
  }

  // 经典水平并排叠放（<= 5 个应用）
  const isFanLayout = count <= 5;
  // 根据应用数量自适应水平重叠负边距
  const overlapMarginClass =
    count === 2
      ? "-ml-7"
      : count === 3
      ? "-ml-9"
      : count === 4
      ? "-ml-11"
      : "-ml-12";

  return (
    <div className="w-full h-full flex items-center justify-center p-2 overflow-x-auto overflow-y-hidden relative select-none">
      {isFanLayout ? (
        /* 经典水平重叠并排扇形排列（完全对齐截图中的并排层叠视觉与避让动效） */
        <div className="relative flex items-center justify-center py-6 w-full">
          {windows.map((win, idx) => {
            const isHovered = hoveredIndex === idx;

            // 计算推开位移 (Push distance on hover)
            let pushX = 0;
            let targetY = 0;
            let targetRotate = baseRotations[idx];
            let scale = 1;

            if (hoveredIndex !== null) {
              if (isHovered) {
                targetY = -12; // 向上弹跳浮起
                targetRotate = 0; // 摆正
                scale = 1.08; // 放大
              } else {
                // 两侧向外弹性推开
                const dir = idx < hoveredIndex ? -1 : 1;
                pushX = dir * 28;
                targetRotate = baseRotations[idx] * 1.3;
              }
            }

            const overlapMargin = idx > 0 ? overlapMarginClass : "";

            return (
              <div
                key={`${win.windowId}-${win.pid}-${idx}`}
                style={{
                  transform: `translate3d(${pushX}px, ${targetY}px, 0) rotate(${targetRotate}deg) scale(${scale})`,
                  zIndex: isHovered ? 50 : 10 + idx,
                  transition:
                    "transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1), z-index 0.1s ease",
                }}
                className={`relative shrink-0 will-change-transform ${overlapMargin}`}
              >
                <WindowCard
                  window={win}
                  index={idx}
                  isSelected={isHovered}
                  isHovered={isHovered}
                  isDarkMode={isDarkMode}
                  showTitles={showTitles}
                  mini={true}
                  onSelect={() => {}}
                  onActivate={() => onActivate(win)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* 超过 5 个应用时：两行微角度自适应并排流 */
        <div className="flex flex-wrap items-center justify-center gap-3 py-2 px-1 max-w-full">
          {windows.map((win, idx) => {
            const isHovered = hoveredIndex === idx;
            let targetY = 0;
            let targetRotate = baseRotations[idx] * 0.7;
            let scale = 1;

            if (isHovered) {
              targetY = -8;
              targetRotate = 0;
              scale = 1.08;
            }

            return (
              <div
                key={`${win.windowId}-${win.pid}-${idx}`}
                style={{
                  transform: `translate3d(0, ${targetY}px, 0) rotate(${targetRotate}deg) scale(${scale})`,
                  zIndex: isHovered ? 50 : 10,
                  transition:
                    "transform 0.24s cubic-bezier(0.34, 1.4, 0.64, 1), z-index 0.1s ease",
                }}
                className="shrink-0 will-change-transform"
              >
                <WindowCard
                  window={win}
                  index={idx}
                  isSelected={isHovered}
                  isHovered={isHovered}
                  isDarkMode={isDarkMode}
                  showTitles={showTitles}
                  mini={true}
                  onSelect={() => {}}
                  onActivate={() => onActivate(win)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
