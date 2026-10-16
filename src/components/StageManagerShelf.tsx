import React, { useState } from "react";
import { AppWindow, ExternalLink, Sparkles } from "lucide-react";
import { WindowInfo } from "../types";

interface Props {
  windows: WindowInfo[];
  isDarkMode: boolean;
  onActivate: (win: WindowInfo) => void;
}

export const StageManagerShelf: React.FC<Props> = ({
  windows,
  isDarkMode,
  onActivate,
}) => {
  const [hoveredWin, setHoveredWin] = useState<WindowInfo | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; right: number }>({
    top: 0,
    right: 0,
  });

  if (windows.length === 0) return null;

  return (
    <div
      className={`w-52 h-full flex flex-col shrink-0 border-l rounded-r-xl overflow-hidden transition-colors ${
        isDarkMode
          ? "bg-neutral-950/70 border-white/10 text-white"
          : "bg-neutral-50/80 border-neutral-300 text-neutral-900"
      }`}
    >
      {/* 侧栏标头 */}
      <div
        className={`px-3 py-2.5 border-b flex items-center justify-between shrink-0 ${
          isDarkMode
            ? "border-white/10 bg-neutral-900/40 text-neutral-300"
            : "border-neutral-200 bg-neutral-200/50 text-neutral-700"
        }`}
      >
        <div className="flex items-center gap-1.5 font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>台前调度</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            isDarkMode
              ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
              : "bg-purple-100 text-purple-700 border border-purple-300"
          }`}
        >
          {windows.length}
        </span>
      </div>

      {/* 列表项内容 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 relative">
        {windows.map((win, idx) => {
          return (
            <div
              key={`${win.windowId}-${win.pid}-${idx}`}
              onClick={() => onActivate(win)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPopoverPos({
                  top: Math.max(10, rect.top - 60),
                  right: window.innerWidth - rect.left + 12,
                });
                setHoveredWin(win);
              }}
              onMouseLeave={() => setHoveredWin(null)}
              className={`group flex items-center gap-2 p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                isDarkMode
                  ? "bg-neutral-900/60 hover:bg-neutral-800/90 border-white/5 hover:border-purple-400/50"
                  : "bg-white hover:bg-neutral-100 border-neutral-200 hover:border-purple-400/60 shadow-xs"
              }`}
            >
              {/* 应用图标 */}
              {win.appIcon ? (
                <img
                  src={win.appIcon}
                  alt={win.appName}
                  className="w-6 h-6 rounded-md object-contain shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                />
              ) : (
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isDarkMode ? "bg-white/10" : "bg-neutral-200"
                  }`}
                >
                  <AppWindow className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              )}

              {/* 应用名称 */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">
                  {win.appName}
                </p>
                {win.title ? (
                  <p
                    className={`text-[10px] truncate ${
                      isDarkMode ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {win.title}
                  </p>
                ) : (
                  <p
                    className={`text-[9px] font-mono ${
                      isDarkMode ? "text-neutral-500" : "text-neutral-400"
                    }`}
                  >
                    {Math.round(win.width)}×{Math.round(win.height)}
                  </p>
                )}
              </div>

              {/* 激活指示图标 */}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity shrink-0" />
            </div>
          );
        })}
      </div>

      {/* 悬浮 Popover 详情卡片 */}
      {hoveredWin && (
        <div
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            right: `${popoverPos.right}px`,
            zIndex: 100,
          }}
          className={`w-64 p-3 rounded-xl border shadow-2xl backdrop-blur-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-100 ${
            isDarkMode
              ? "bg-neutral-900/95 border-purple-500/40 text-white shadow-purple-500/10"
              : "bg-white/95 border-purple-400/60 text-neutral-900 shadow-xl"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            {hoveredWin.appIcon ? (
              <img
                src={hoveredWin.appIcon}
                alt={hoveredWin.appName}
                className="w-7 h-7 rounded-lg object-contain shadow-xs"
              />
            ) : (
              <AppWindow className="w-6 h-6 text-purple-400" />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold truncate leading-tight">
                {hoveredWin.appName}
              </h4>
              <span className="text-[10px] font-mono text-purple-400 font-medium">
                PID: {hoveredWin.pid} · 台前调度
              </span>
            </div>
          </div>

          {hoveredWin.title && (
            <div
              className={`mb-2 p-1.5 rounded text-[11px] leading-relaxed break-words line-clamp-3 ${
                isDarkMode
                  ? "bg-black/40 text-neutral-200 border border-white/5"
                  : "bg-neutral-100 text-neutral-700 border border-neutral-200"
              }`}
            >
              {hoveredWin.title}
            </div>
          )}

          <div
            className={`flex items-center justify-between text-[10px] font-mono pt-1 ${
              isDarkMode ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            <span>
              尺寸: {Math.round(hoveredWin.width)} ×{" "}
              {Math.round(hoveredWin.height)}
            </span>
            <span className="text-purple-400 font-semibold flex items-center gap-1">
              <ExternalLink className="w-2.5 h-2.5" />
              点击激活
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
