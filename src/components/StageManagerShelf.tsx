import React, { useState, useRef, useEffect } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [hoveredWin, setHoveredWin] = useState<WindowInfo | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; right: number }>({
    top: 0,
    right: 0,
  });

  const listContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    top: number;
    height: number;
    opacity: number;
  }>({
    top: 0,
    height: 0,
    opacity: 0,
  });

  // 动态同步 AnimatedList 滑动胶囊指示器 (Gliding Selection Pill)
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      const el = itemRefs.current[selectedIndex];
      if (el) {
        setIndicatorStyle({
          top: el.offsetTop,
          height: el.offsetHeight,
          opacity: 1,
        });
      }
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [selectedIndex, windows]);

  if (windows.length === 0) return null;

  return (
    <div
      className={`w-60 h-full flex flex-col shrink-0 border-l rounded-r-xl overflow-hidden transition-colors ${
        isDarkMode
          ? "bg-neutral-950/70 border-white/10 text-white"
          : "bg-neutral-50/90 border-neutral-300 text-neutral-900"
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
          {windows.length} 个应用
        </span>
      </div>

      {/* AnimatedList 动效列表容器（带上下边缘渐变虚化遮罩 Fade Mask） */}
      <div
        ref={listContainerRef}
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 14px, black calc(100% - 14px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 14px, black calc(100% - 14px), transparent 100%)",
        }}
        className="flex-1 overflow-y-auto p-2 relative"
      >
        {/* 滑动的背景选择胶囊光标 (Gliding Pill Indicator) */}
        <div
          style={{
            transform: `translate3d(0, ${indicatorStyle.top}px, 0)`,
            height: `${indicatorStyle.height}px`,
            opacity: indicatorStyle.opacity,
            transition:
              "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.2s ease, opacity 0.15s ease",
          }}
          className={`absolute left-2 right-2 rounded-xl pointer-events-none z-0 border ${
            isDarkMode
              ? "bg-purple-500/15 border-purple-400/40 shadow-sm shadow-purple-500/20"
              : "bg-purple-500/10 border-purple-400/50 shadow-xs"
          }`}
        />

        {/* 列表项集合 */}
        <div className="space-y-1.5 relative z-10">
          {windows.map((win, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={`${win.windowId}-${win.pid}-${idx}`}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                onClick={() => {
                  setSelectedIndex(idx);
                  onActivate(win);
                }}
                onMouseEnter={(e) => {
                  setSelectedIndex(idx);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPopoverPos({
                    top: Math.max(10, rect.top - 60),
                    right: window.innerWidth - rect.left + 12,
                  });
                  setHoveredWin(win);
                }}
                onMouseLeave={() => setHoveredWin(null)}
                className={`group flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? isDarkMode
                      ? "border-transparent"
                      : "border-transparent"
                    : isDarkMode
                    ? "bg-neutral-900/40 border-white/5 hover:border-white/10"
                    : "bg-white/70 border-neutral-200/80 hover:border-neutral-300"
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

                {/* 应用名称与标题 */}
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
                <ExternalLink
                  className={`w-3 h-3 shrink-0 text-purple-400 transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 悬浮 Popover 详情卡片 */}
      {hoveredWin && (
        <div
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            right: `${popoverPos.right}px`,
            zIndex: 150,
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
