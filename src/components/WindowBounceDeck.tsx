import React, { useState, useMemo } from "react";
import { WindowInfo } from "../types";
import { WindowCard } from "./WindowCard";

interface Props {
  windows: WindowInfo[];
  selectedIndex: number;
  isDarkMode: boolean;
  showTitles: boolean;
  onSelect: (index: number) => void;
  onActivate: (window: WindowInfo) => void;
}

export const WindowBounceDeck: React.FC<Props> = ({
  windows,
  selectedIndex,
  isDarkMode,
  showTitles,
  onSelect,
  onActivate,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const count = windows.length;

  // 预设 BounceCards 自然微角度
  const baseRotations = useMemo(() => {
    const rots = [-3.2, 2.5, -2.0, 3.0, -1.8, 2.2, -2.8, 1.6];
    return windows.map((_, i) => rots[i % rots.length]);
  }, [windows]);

  // 判断是否适合采用 BounceCards 经典水平扇形叠放（少于等于 6 个应用时）
  const isFanLayout = count <= 6 && count > 1;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-y-auto overflow-x-hidden relative">
      {isFanLayout ? (
        /* 经典 BounceCards 水平重叠扇形排列（少于等于 6 个应用） */
        <div className="relative flex items-center justify-center min-h-[220px] py-10 w-full">
          {windows.map((win, idx) => {
            const isSelected = selectedIndex === idx;
            const isHovered = hoveredIndex === idx;
            const isCurrent = activeIndex === idx;

            // 计算推开位移 (Push distance on hover)
            let pushX = 0;
            let targetY = 0;
            let targetRotate = baseRotations[idx];
            let scale = 1;

            if (activeIndex >= 0) {
              if (isCurrent) {
                targetY = -16; // 向上弹跳浮起
                targetRotate = 0; // 摆正
                scale = 1.08; // 放大
              } else {
                // 两侧向外弹性推开
                const dir = idx < activeIndex ? -1 : 1;
                pushX = dir * 52;
                targetRotate = baseRotations[idx] * 1.3;
              }
            }

            // 基础重合负边距（产生层叠牌组质感）
            const overlapMargin = idx > 0 ? "-ml-16" : "";

            return (
              <div
                key={`${win.windowId}-${win.pid}-${idx}`}
                style={{
                  transform: `translate3d(${pushX}px, ${targetY}px, 0) rotate(${targetRotate}deg) scale(${scale})`,
                  zIndex: isCurrent ? 50 : 10 + idx,
                  transition:
                    "transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1), z-index 0.1s ease",
                }}
                className={`relative shrink-0 will-change-transform ${overlapMargin}`}
              >
                <WindowCard
                  window={win}
                  index={idx}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isDarkMode={isDarkMode}
                  showTitles={showTitles}
                  onSelect={() => onSelect(idx)}
                  onActivate={() => onActivate(win)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </div>
            );
          })}
        </div>
      ) : count === 1 ? (
        /* 单卡片居中展示 */
        <div className="flex items-center justify-center p-6">
          <div
            style={{
              transform: selectedIndex === 0 ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1)",
            }}
          >
            <WindowCard
              window={windows[0]}
              index={0}
              isSelected={selectedIndex === 0}
              isHovered={hoveredIndex === 0}
              isDarkMode={isDarkMode}
              showTitles={showTitles}
              onSelect={() => onSelect(0)}
              onActivate={() => onActivate(windows[0])}
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </div>
        </div>
      ) : (
        /* 多卡片（> 6 个应用）弹性自适应网格流（带 BounceCards 微角度与悬浮弹起） */
        <div className="flex flex-wrap items-center justify-center gap-6 max-w-5xl py-6 px-4">
          {windows.map((win, idx) => {
            const isSelected = selectedIndex === idx;
            const isHovered = hoveredIndex === idx;
            const isCurrent = activeIndex === idx;

            let targetY = 0;
            let targetRotate = baseRotations[idx];
            let scale = 1;

            if (isCurrent) {
              targetY = -12;
              targetRotate = 0;
              scale = 1.06;
            }

            return (
              <div
                key={`${win.windowId}-${win.pid}-${idx}`}
                style={{
                  transform: `translate3d(0, ${targetY}px, 0) rotate(${targetRotate}deg) scale(${scale})`,
                  zIndex: isCurrent ? 40 : 10,
                  transition:
                    "transform 0.26s cubic-bezier(0.34, 1.4, 0.64, 1), z-index 0.1s ease",
                }}
                className="shrink-0 will-change-transform"
              >
                <WindowCard
                  window={win}
                  index={idx}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isDarkMode={isDarkMode}
                  showTitles={showTitles}
                  onSelect={() => onSelect(idx)}
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
