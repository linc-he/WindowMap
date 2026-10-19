import React from "react";
import { WindowInfo } from "../types";
import { AppWindow, ExternalLink } from "lucide-react";
import { getAppTheme } from "../utils/colors";

interface Props {
  window: WindowInfo;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  isDarkMode: boolean;
  showTitles: boolean;
  compact?: boolean;
  style?: React.CSSProperties;
  onSelect: () => void;
  onActivate: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const WindowCard: React.FC<Props> = ({
  window: win,
  index,
  isSelected,
  isHovered,
  isDarkMode,
  showTitles,
  compact = false,
  style,
  onSelect,
  onActivate,
  onMouseEnter,
  onMouseLeave,
}) => {
  const theme = getAppTheme(win.appName);

  const bgClass = isDarkMode ? theme.bgDark : theme.bgLight;
  const borderClass = isDarkMode ? theme.borderDark : theme.borderLight;
  const activeBorderClass = isDarkMode
    ? theme.activeBorderDark
    : theme.activeBorderLight;
  const badgeClass = isDarkMode ? theme.badgeDark : theme.badgeLight;

  const cardWidth = compact ? "188px" : "244px";
  const cardHeight = compact ? "118px" : "152px";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      onMouseEnter={() => {
        onSelect();
        onMouseEnter?.();
      }}
      onMouseLeave={onMouseLeave}
      style={{
        width: cardWidth,
        height: cardHeight,
        boxShadow: isSelected
          ? `0 0 30px -2px ${theme.accent}99, 0 16px 32px -4px rgba(0,0,0,${
              isDarkMode ? 0.75 : 0.25
            })`
          : isHovered
          ? `0 0 20px -2px ${theme.accent}66, 0 12px 24px -4px rgba(0,0,0,${
              isDarkMode ? 0.6 : 0.18
            })`
          : `0 6px 16px -2px rgba(0,0,0,${isDarkMode ? 0.45 : 0.1})`,
        ...style,
      }}
      className={`group cursor-pointer ${
        compact ? "rounded-xl" : "rounded-2xl"
      } select-none flex flex-col justify-between overflow-hidden border backdrop-blur-2xl will-change-transform ${
        isSelected
          ? `${activeBorderClass} shadow-2xl ring-2 ${
              isDarkMode ? "ring-white/40" : "ring-black/20"
            }`
          : isHovered
          ? `${borderClass} ring-2 ring-white/50`
          : `${borderClass} ${bgClass}`
      } ${
        isDarkMode
          ? "bg-neutral-900/90 text-white"
          : "bg-white/95 text-neutral-900"
      }`}
    >
      {/* 顶部彩色装饰条 */}
      <div
        style={{ backgroundColor: theme.accent }}
        className={`${
          compact ? "h-1.5" : "h-2"
        } w-full shrink-0 opacity-95 transition-opacity`}
      />

      {/* 核心卡片内容区域 */}
      <div
        className={`${
          compact ? "p-2" : "p-3"
        } flex-1 flex flex-col justify-between overflow-hidden pointer-events-none`}
      >
        {/* 顶部标头：大图标 + 应用名 + 序号徽章 */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            {win.appIcon ? (
              <img
                src={win.appIcon}
                alt={win.appName}
                className={`${
                  compact ? "w-5 h-5 rounded-md" : "w-7 h-7 rounded-lg"
                } object-contain shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                loading="lazy"
              />
            ) : (
              <div
                className={`${
                  compact ? "w-5 h-5 rounded-md" : "w-7 h-7 rounded-lg"
                } flex items-center justify-center shrink-0 ${
                  isDarkMode ? "bg-white/10" : "bg-neutral-200"
                }`}
              >
                <AppWindow
                  className={`${compact ? "w-3 h-3" : "w-4 h-4"} ${
                    isDarkMode ? "text-neutral-300" : "text-neutral-600"
                  }`}
                />
              </div>
            )}
            <span
              className={`${
                compact ? "text-xs font-bold" : "text-sm font-bold"
              } truncate tracking-wide ${
                isDarkMode ? "text-white" : "text-neutral-900"
              }`}
            >
              {win.appName}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* 序号徽章 */}
            <span
              className={`${
                compact ? "text-[9px] px-1.5 py-0.2" : "text-[11px] px-2 py-0.5"
              } font-mono rounded-full shrink-0 shadow-xs ${
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

        {/* 窗口真实标题显示（清晰单行截断或展开） */}
        <div className={`${compact ? "my-0.5" : "my-1.5"} min-w-0`}>
          {showTitles && win.title ? (
            <div
              className={`${
                compact ? "px-1.5 py-0.5" : "px-2 py-1"
              } rounded-md border truncate ${
                isDarkMode
                  ? "bg-black/35 border-white/10 text-neutral-200"
                  : "bg-neutral-100 border-neutral-300 text-neutral-700"
              }`}
            >
              <p
                className={`${
                  compact ? "text-[10px]" : "text-xs"
                } truncate font-medium`}
              >
                {win.title}
              </p>
            </div>
          ) : (
            <div
              className={`${
                compact ? "h-4 text-[9px]" : "h-6 text-[11px]"
              } flex items-center text-neutral-400 font-normal truncate`}
            >
              <span>正常运行中</span>
            </div>
          )}
        </div>

        {/* 底部信息栏 */}
        <div
          className={`flex items-center justify-between ${
            compact ? "text-[8.5px] pt-0.5" : "text-[10px] pt-1"
          } font-mono border-t ${
            isDarkMode
              ? "border-white/5 text-neutral-400"
              : "border-neutral-200 text-neutral-500"
          }`}
        >
          <span>
            {Math.round(win.width)}×{Math.round(win.height)}
          </span>
          <span className="flex items-center gap-0.5 font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-sky-400">
            <ExternalLink className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"}`} />
            点击激活
          </span>
        </div>
      </div>
    </div>
  );
};
