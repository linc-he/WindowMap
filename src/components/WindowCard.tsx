import React, { useState } from "react";
import { ScreenInfo, WindowInfo } from "../types";
import { AppWindow, Layers } from "lucide-react";
import { getAppTheme } from "../utils/colors";

interface Props {
  window: WindowInfo;
  screen: ScreenInfo;
  index: number;
  stackIndex: number;
  totalInStack: number;
  isSelected: boolean;
  showTitles: boolean;
  onSelect: () => void;
  onActivate: () => void;
}

export const WindowCard: React.FC<Props> = ({
  window: win,
  screen,
  index,
  stackIndex,
  totalInStack,
  isSelected,
  showTitles,
  onSelect,
  onActivate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = getAppTheme(win.appName);

  // 计算在屏幕中的百分比坐标（保证真实落点，避免无端拉伸或被挤压到边缘）
  const leftPercent = Math.max(
    0,
    Math.min(96, ((win.x - screen.x) / screen.width) * 100)
  );
  const topPercent = Math.max(
    0,
    Math.min(96, ((win.y - screen.y) / screen.height) * 100)
  );
  const widthPercent = Math.max(
    8,
    Math.min(100 - leftPercent, (win.width / screen.width) * 100)
  );
  const heightPercent = Math.max(
    8,
    Math.min(100 - topPercent, (win.height / screen.height) * 100)
  );

  // 叠放错落位移计算（当同一位置有多窗口叠放时，产生层叠卡片效果，确保每一层都能露出并点击）
  const staggerX = totalInStack > 1 ? stackIndex * 14 : 0;
  const staggerY = totalInStack > 1 ? stackIndex * 14 : 0;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onSelect();
      }}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        transform: `translate(${staggerX}px, ${staggerY}px)${
          isSelected || isHovered ? " scale(1.015)" : ""
        }`,
        zIndex: isSelected ? 60 : isHovered ? 50 : 10 + stackIndex,
        boxShadow: isSelected
          ? `0 0 24px -2px ${theme.accent}66, 0 10px 25px -5px rgba(0,0,0,0.7)`
          : isHovered
          ? `0 0 16px -2px ${theme.accent}44, 0 8px 20px -4px rgba(0,0,0,0.6)`
          : "0 4px 12px -2px rgba(0,0,0,0.5)",
      }}
      className={`absolute transition-all duration-200 ease-out cursor-pointer rounded-xl select-none flex flex-col justify-between overflow-hidden border backdrop-blur-xl ${
        theme.bg
      } ${
        isSelected
          ? `${theme.activeBorder} shadow-2xl`
          : isHovered
          ? `${theme.border} ring-1 ring-white/30`
          : `${theme.border} bg-neutral-900/80`
      }`}
    >
      {/* 顶部彩色装饰条与标头 */}
      <div
        style={{ backgroundColor: theme.accent }}
        className="h-1.5 w-full shrink-0 opacity-80"
      />

      {/* 核心标头内容 */}
      <div className="p-2 flex-1 flex flex-col justify-between overflow-hidden pointer-events-none">
        <div className="flex items-center justify-between gap-1 w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            {win.appIcon ? (
              <img
                src={win.appIcon}
                alt={win.appName}
                className="w-5 h-5 rounded-md object-contain shrink-0 shadow-sm"
                loading="lazy"
              />
            ) : (
              <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                <AppWindow className="w-3.5 h-3.5 text-neutral-300" />
              </div>
            )}
            <span
              style={{ color: isSelected ? "#ffffff" : "#f1f5f9" }}
              className="text-xs font-bold truncate tracking-wide drop-shadow-sm"
            >
              {win.appName}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* 叠放指示器 */}
            {totalInStack > 1 && (
              <span className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/15 text-neutral-200">
                <Layers className="w-2.5 h-2.5" />
                <span>{stackIndex + 1}/{totalInStack}</span>
              </span>
            )}

            {/* 序号徽章 */}
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 shadow-sm ${
                isSelected
                  ? "bg-white text-neutral-950 font-black"
                  : theme.badge
              }`}
            >
              #{index + 1}
            </span>
          </div>
        </div>

        {/* 窗口真实标题显示 */}
        {showTitles && win.title && (
          <div className="mt-1 px-1 py-0.5 rounded bg-black/30 border border-white/5 truncate">
            <p className="text-[11px] text-neutral-200 truncate font-normal">
              {win.title}
            </p>
          </div>
        )}

        {/* 底部信息栏 */}
        <div className="mt-auto pt-1 flex items-center justify-between text-[9px] font-mono text-neutral-400">
          {win.isStageManager ? (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
              台前调度
            </span>
          ) : (
            <span className="opacity-0">·</span>
          )}
          <span className="text-neutral-400/80">
            {Math.round(win.width)}×{Math.round(win.height)}
          </span>
        </div>
      </div>
    </div>
  );
};
