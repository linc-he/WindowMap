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
  isDarkMode: boolean;
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
  isDarkMode,
  showTitles,
  onSelect,
  onActivate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = getAppTheme(win.appName);

  // 计算在屏幕中的百分比坐标
  const leftPercent = Math.max(
    0,
    Math.min(94, ((win.x - screen.x) / screen.width) * 100)
  );
  const topPercent = Math.max(
    0,
    Math.min(94, ((win.y - screen.y) / screen.height) * 100)
  );
  const widthPercent = Math.max(
    10,
    Math.min(100 - leftPercent, (win.width / screen.width) * 100)
  );
  const heightPercent = Math.max(
    10,
    Math.min(100 - topPercent, (win.height / screen.height) * 100)
  );

  // 叠放错落阶梯位移：多窗口同位置时按 20px 阶梯向右下级联，确保每一层露出顶部与侧边
  const staggerX = totalInStack > 1 ? stackIndex * 20 : 0;
  const staggerY = totalInStack > 1 ? stackIndex * 20 : 0;

  const bgClass = isDarkMode ? theme.bgDark : theme.bgLight;
  const borderClass = isDarkMode ? theme.borderDark : theme.borderLight;
  const activeBorderClass = isDarkMode
    ? theme.activeBorderDark
    : theme.activeBorderLight;
  const badgeClass = isDarkMode ? theme.badgeDark : theme.badgeLight;

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
          isSelected || isHovered ? " scale(1.02)" : ""
        }`,
        zIndex: isSelected ? 90 : isHovered ? 80 : 10 + stackIndex,
        boxShadow: isSelected
          ? `0 0 24px -2px ${theme.accent}88, 0 12px 28px -4px rgba(0,0,0,${
              isDarkMode ? 0.7 : 0.25
            })`
          : isHovered
          ? `0 0 16px -2px ${theme.accent}55, 0 8px 20px -4px rgba(0,0,0,${
              isDarkMode ? 0.6 : 0.2
            })`
          : `0 4px 12px -2px rgba(0,0,0,${isDarkMode ? 0.5 : 0.12})`,
      }}
      className={`absolute transition-all duration-200 ease-out cursor-pointer rounded-xl select-none flex flex-col justify-between overflow-hidden border backdrop-blur-2xl ${
        isSelected
          ? `${activeBorderClass} shadow-2xl`
          : isHovered
          ? `${borderClass} ring-2 ring-white/50`
          : `${borderClass} ${bgClass}`
      } ${
        isDarkMode
          ? "bg-neutral-900/85 text-white"
          : "bg-white/95 text-neutral-900"
      }`}
    >
      {/* 顶部彩色装饰条 */}
      <div
        style={{ backgroundColor: theme.accent }}
        className="h-2 w-full shrink-0 opacity-90 transition-opacity"
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
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  isDarkMode ? "bg-white/10" : "bg-neutral-200"
                }`}
              >
                <AppWindow
                  className={`w-3.5 h-3.5 ${
                    isDarkMode ? "text-neutral-300" : "text-neutral-600"
                  }`}
                />
              </div>
            )}
            <span
              className={`text-xs font-bold truncate tracking-wide ${
                isDarkMode ? "text-white" : "text-neutral-900"
              }`}
            >
              {win.appName}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* 叠放指示器 */}
            {totalInStack > 1 && (
              <span
                className={`flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                  isDarkMode
                    ? "bg-white/15 text-neutral-200"
                    : "bg-neutral-200 text-neutral-700"
                }`}
              >
                <Layers className="w-2.5 h-2.5" />
                <span>
                  {stackIndex + 1}/{totalInStack}
                </span>
              </span>
            )}

            {/* 序号徽章 */}
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 shadow-sm ${
                isSelected
                  ? isDarkMode
                    ? "bg-white text-neutral-950 font-black"
                    : "bg-neutral-950 text-white font-black"
                  : badgeClass
              }`}
            >
              #{index + 1}
            </span>
          </div>
        </div>

        {/* 窗口真实标题显示 */}
        {showTitles && win.title && (
          <div
            className={`mt-1 px-1.5 py-0.5 rounded border truncate ${
              isDarkMode
                ? "bg-black/40 border-white/10 text-neutral-200"
                : "bg-neutral-100 border-neutral-300 text-neutral-700"
            }`}
          >
            <p className="text-[11px] truncate font-normal">{win.title}</p>
          </div>
        )}

        {/* 底部信息栏 */}
        <div
          className={`mt-auto pt-1 flex items-center justify-between text-[9px] font-mono ${
            isDarkMode ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          <span className="opacity-0">·</span>
          <span>
            {Math.round(win.width)}×{Math.round(win.height)}
          </span>
        </div>
      </div>
    </div>
  );
};
