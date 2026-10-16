import React from "react";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { useStore } from "../store/useStore";

export const PermissionGuide: React.FC = () => {
  const { isAccessibilityGranted, openPermissionSettings } = useStore();

  if (isAccessibilityGranted) return null;

  return (
    <div className="mx-4 mb-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          需要 <strong>辅助功能 (Accessibility)</strong> 权限以激活并置顶目标窗口。
        </span>
      </div>
      <button
        onClick={openPermissionSettings}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium transition cursor-pointer shrink-0 ml-3 shadow"
      >
        <span>去授权</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};
