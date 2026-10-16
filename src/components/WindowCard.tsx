import React from "react";
import { ScreenInfo, WindowInfo } from "../types";
import { AppWindow } from "lucide-react";

interface Props {
  window: WindowInfo;
  screen: ScreenInfo;
  index: number;
  isSelected: boolean;
  showTitles: boolean;
  onSelect: () => void;
  onActivate: () => void;
}

export const WindowCard: React.FC<Props> = ({
  window: win,
  screen,
  index,
  isSelected,
  showTitles,
  onSelect,
  onActivate,
}) => {
  // 计算在屏幕中的百分比坐标
  const leftPercent = Math.max(
    0,
    Math.min(100, ((win.x - screen.x) / screen.width) * 100)
  );
  const topPercent = Math.max(
    0,
    Math.min(100, ((win.y - screen.y) / screen.height) * 100)
  );
  const widthPercent = Math.max(
    4,
    Math.min(100 - leftPercent, (win.width / screen.width) * 100)
  );
  const heightPercent = Math.max(
    4,
    Math.min(100 - topPercent, (win.height / screen.height) * 100)
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      onMouseEnter={onSelect}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        zIndex: isSelected ? 50 : win.zOrder + 1,
      }}
      className={`absolute transition-all duration-150 ease-out cursor-pointer rounded-xl p-2 select-none flex flex-col justify-between overflow-hidden border ${
        isSelected
          ? "bg-sky-500/25 border-sky-400 ring-2 ring-sky-400/80 shadow-lg shadow-sky-500/20 scale-[1.01]"
          : "bg-neutral-800/75 hover:bg-neutral-750/90 border-white/15 hover:border-white/35 shadow-md"
      }`}
    >
      {/* 顶部栏：App 图标与序号 */}
      <div className="flex items-center justify-between gap-1 w-full pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          {win.appIcon ? (
            <img
              src={win.appIcon}
              alt={win.appName}
              className="w-5 h-5 rounded-md object-contain shrink-0 shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="w-5 h-5 rounded-md bg-neutral-700 flex items-center justify-center shrink-0">
              <AppWindow className="w-3.5 h-3.5 text-neutral-300" />
            </div>
          )}
          <span className="text-xs font-semibold text-white/95 truncate tracking-wide">
            {win.appName}
          </span>
        </div>

        {/* 序号徽章 */}
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
            isSelected
              ? "bg-sky-500 text-white font-bold"
              : "bg-white/10 text-neutral-300"
          }`}
        >
          {index + 1}
        </span>
      </div>

      {/* 底部信息：可选窗口标题或尺寸 */}
      {showTitles && win.title && (
        <div className="mt-1 pointer-events-none">
          <p className="text-[11px] text-neutral-300 truncate font-normal">
            {win.title}
          </p>
        </div>
      )}

      {/* 尺寸微标 (在较大卡片右下角轻量提示) */}
      <div className="self-end mt-auto pointer-events-none">
        <span className="text-[9px] text-neutral-400/60 font-mono">
          {Math.round(win.width)}×{Math.round(win.height)}
        </span>
      </div>
    </div>
  );
};
