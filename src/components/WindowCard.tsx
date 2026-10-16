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
        width: "244px",
        height: "152px",
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
      className={`group cursor-pointer rounded-2xl select-none flex flex-col justify-between overflow-hidden border backdrop-blur-2xl will-change-transform ${
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
        className="h-2 w-full shrink-0 opacity-95 transition-opacity"
      />

      {/* 核心卡片内容区域 */}
      <div className="p-3 flex-1 flex flex-col justify-between overflow-hidden pointer-events-none">
        {/* 顶部标头：大图标 + 应用名 + 序号徽章 */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <div className="flex items-center gap-2 min-w-0">
            {win.appIcon ? (
              <img
                src={win.appIcon}
                alt={win.appName}
                className="w-7 h-7 rounded-lg object-contain shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isDarkMode ? "bg-white/10" : "bg-neutral-200"
                }`}
              >
                <AppWindow
                  className={`w-4 h-4 ${
                    isDarkMode ? "text-neutral-300" : "text-neutral-600"
                  }`}
                />
              </div>
            )}
            <span
              className={`text-sm font-bold truncate tracking-wide ${
                isDarkMode ? "text-white" : "text-neutral-900"
              }`}
            >
              {win.appName}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* 序号徽章 */}
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 shadow-xs ${
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
        <div className="my-1.5 min-w-0">
          {showTitles && win.title ? (
            <div
              className={`px-2 py-1 rounded-lg border truncate ${
                isDarkMode
                  ? "bg-black/35 border-white/10 text-neutral-200"
                  : "bg-neutral-100 border-neutral-300 text-neutral-700"
              }`}
            >
              <p className="text-xs truncate font-medium">{win.title}</p>
            </div>
          ) : (
            <div className="h-6 flex items-center text-[11px] text-neutral-400 font-normal truncate">
              <span>应用正常运行中</span>
            </div>
          )}
        </div>

        {/* 底部信息栏 */}
        <div
          className={`flex items-center justify-between text-[10px] font-mono pt-1 border-t ${
            isDarkMode
              ? "border-white/5 text-neutral-400"
              : "border-neutral-200 text-neutral-500"
          }`}
        >
          <span>
            {Math.round(win.width)}×{Math.round(win.height)}
          </span>
          <span className="flex items-center gap-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-sky-400">
            <ExternalLink className="w-2.5 h-2.5" />
            点击激活
          </span>
        </div>
      </div>
    </div>
  );
};
