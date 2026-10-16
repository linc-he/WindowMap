import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { AppSettings, ScreenInfo, WindowInfo } from "../types";

export function applyTheme(theme: "dark" | "light" | "system") {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

interface State {
  screens: ScreenInfo[];
  currentScreen: ScreenInfo | null;
  selectedScreenId: number | null;
  allWindows: WindowInfo[];
  windows: WindowInfo[]; // 主工作区活跃窗口
  stageWindows: WindowInfo[]; // 台前调度收纳窗口
  selectedIndex: number;
  isAccessibilityGranted: boolean;
  showSettings: boolean;
  isLoading: boolean;
  settings: AppSettings;

  fetchState: () => Promise<void>;
  setSelectedScreenId: (id: number) => void;
  getActiveScreen: () => ScreenInfo | null;
  activateSelected: () => Promise<void>;
  activateWindow: (win: WindowInfo) => Promise<void>;
  hideOverlay: () => Promise<void>;
  setSelectedIndex: (idx: number) => void;
  setShowSettings: (show: boolean) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateGlobalShortcut: (newShortcut: string) => Promise<void>;
  checkPermission: () => Promise<void>;
  openPermissionSettings: () => Promise<void>;

  navigateDirection: (direction: "up" | "down" | "left" | "right") => void;
  navigateNext: () => void;
  navigatePrev: () => void;
}

const SETTINGS_STORAGE_KEY = "windowmap_settings";

const defaultSettings: AppSettings = {
  shortcut: "Alt+Space",
  anchor: "center",
  previewRatio: 0.55,
  scope: "current-screen",
  showWindowTitles: true,
  includeStageManager: true,
  theme: "dark",
  closeOnActivate: true,
};

function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...defaultSettings, ...parsed };
      applyTheme(merged.theme);
      return merged;
    }
  } catch (e) {
    console.error("加载设置失败，使用默认配置", e);
  }
  applyTheme(defaultSettings.theme);
  return defaultSettings;
}

function filterWindowsForScreen(
  all: WindowInfo[],
  screen: ScreenInfo | null
): { main: WindowInfo[]; stage: WindowInfo[] } {
  if (!screen) return { main: [], stage: [] };

  const onScreen = all.filter((w) => {
    if (w.screenId > 0) {
      return w.screenId === screen.id;
    }
    const cx = w.x + w.width / 2;
    const cy = w.y + w.height / 2;
    return (
      cx >= screen.x &&
      cx < screen.x + screen.width &&
      cy >= screen.y &&
      cy < screen.y + screen.height
    );
  });

  const stage = onScreen.filter((w) => w.isStageManager);
  const main = onScreen.filter((w) => !w.isStageManager);

  return { main, stage };
}

export const useStore = create<State>((set, get) => ({
  screens: [],
  currentScreen: null,
  selectedScreenId: null,
  allWindows: [],
  windows: [],
  stageWindows: [],
  selectedIndex: 0,
  isAccessibilityGranted: true,
  showSettings: false,
  isLoading: false,
  settings: loadSavedSettings(),

  getActiveScreen: () => {
    const { screens, currentScreen, selectedScreenId } = get();
    if (selectedScreenId !== null) {
      const found = screens.find((s) => s.id === selectedScreenId);
      if (found) return found;
    }
    return currentScreen || screens[0] || null;
  },

  setSelectedScreenId: (id: number) => {
    set({ selectedScreenId: id });
    const { allWindows, screens } = get();
    const activeScreen = screens.find((s) => s.id === id) || null;
    const { main, stage } = filterWindowsForScreen(allWindows, activeScreen);

    set({
      windows: main,
      stageWindows: stage,
      selectedIndex: main.length > 0 ? 0 : -1,
    });
  },

  fetchState: async () => {
    try {
      set({ isLoading: true });
      const [screens, currentScreen, allWindows, isAccessibilityGranted] =
        await Promise.all([
          invoke<ScreenInfo[]>("get_screens"),
          invoke<ScreenInfo>("get_current_screen"),
          invoke<WindowInfo[]>("list_windows"),
          invoke<boolean>("get_accessibility_status"),
        ]);

      const state = get();
      const activeScreen =
        state.selectedScreenId !== null
          ? screens.find((s) => s.id === state.selectedScreenId) || currentScreen
          : currentScreen || screens[0];

      const { main, stage } = filterWindowsForScreen(allWindows, activeScreen);

      set({
        screens,
        currentScreen,
        selectedScreenId: activeScreen ? activeScreen.id : null,
        allWindows,
        windows: main,
        stageWindows: stage,
        isAccessibilityGranted,
        selectedIndex: main.length > 0 ? 0 : -1,
        isLoading: false,
      });
    } catch (e) {
      console.error("fetchState 错误:", e);
      set({ isLoading: false });
    }
  },

  activateSelected: async () => {
    const { windows, selectedIndex, activateWindow } = get();
    if (selectedIndex >= 0 && selectedIndex < windows.length) {
      await activateWindow(windows[selectedIndex]);
    }
  },

  activateWindow: async (win: WindowInfo) => {
    try {
      const { settings } = get();
      await invoke("activate_window", {
        pid: win.pid,
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
        closeOverlay: settings.closeOnActivate,
      });
    } catch (e) {
      console.error("激活窗口失败:", e);
    }
  },

  hideOverlay: async () => {
    try {
      await invoke("hide_overlay");
    } catch (e) {
      console.error("隐藏浮层失败:", e);
    }
  },

  setSelectedIndex: (idx: number) => {
    set({ selectedIndex: idx });
  },

  setShowSettings: (show: boolean) => {
    set({ showSettings: show });
  },

  updateSettings: (newSettings: Partial<AppSettings>) => {
    const prev = get().settings;
    const updated = { ...prev, ...newSettings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    set({ settings: updated });

    // 主题切换立即生效
    if (newSettings.theme && newSettings.theme !== prev.theme) {
      applyTheme(newSettings.theme);
    }

    // 锚点或尺寸变化时，立即通知 Rust 动态调整 Overlay 窗口
    if (
      newSettings.previewRatio !== undefined ||
      newSettings.anchor !== undefined
    ) {
      invoke("apply_panel_settings", {
        anchor: updated.anchor,
        ratio: updated.previewRatio,
      }).catch((err) => {
        console.error("动态调整面板尺寸位置失败:", err);
      });
    }
  },

  updateGlobalShortcut: async (newShortcut: string) => {
    const oldShortcut = get().settings.shortcut;
    try {
      await invoke("update_global_shortcut", {
        oldShortcut,
        newShortcut,
      });
      get().updateSettings({ shortcut: newShortcut });
    } catch (e) {
      console.error("更新全局快捷键失败:", e);
      throw e;
    }
  },

  checkPermission: async () => {
    try {
      const isGranted = await invoke<boolean>("get_accessibility_status");
      set({ isAccessibilityGranted: isGranted });
    } catch (e) {
      console.error("检查权限出错:", e);
    }
  },

  openPermissionSettings: async () => {
    try {
      await invoke("request_accessibility_settings");
    } catch (e) {
      console.error("打开权限设置出错:", e);
    }
  },

  navigateNext: () => {
    const { windows, selectedIndex } = get();
    if (windows.length === 0) return;
    set({ selectedIndex: (selectedIndex + 1) % windows.length });
  },

  navigatePrev: () => {
    const { windows, selectedIndex } = get();
    if (windows.length === 0) return;
    set({ selectedIndex: (selectedIndex - 1 + windows.length) % windows.length });
  },

  navigateDirection: (direction: "up" | "down" | "left" | "right") => {
    const { windows, selectedIndex } = get();
    if (windows.length <= 1 || selectedIndex < 0) return;

    const current = windows[selectedIndex];
    const currentCx = current.x + current.width / 2;
    const currentCy = current.y + current.height / 2;

    let bestIdx = -1;
    let minDistance = Infinity;

    for (let i = 0; i < windows.length; i++) {
      if (i === selectedIndex) continue;
      const target = windows[i];
      const targetCx = target.x + target.width / 2;
      const targetCy = target.y + target.height / 2;

      const dx = targetCx - currentCx;
      const dy = targetCy - currentCy;

      let isValidDirection = false;
      let directionalDistance = 0;

      switch (direction) {
        case "right":
          isValidDirection = dx > 15;
          directionalDistance = dx + Math.abs(dy) * 1.6;
          break;
        case "left":
          isValidDirection = dx < -15;
          directionalDistance = -dx + Math.abs(dy) * 1.6;
          break;
        case "down":
          isValidDirection = dy > 15;
          directionalDistance = dy + Math.abs(dx) * 1.6;
          break;
        case "up":
          isValidDirection = dy < -15;
          directionalDistance = -dy + Math.abs(dx) * 1.6;
          break;
      }

      if (isValidDirection && directionalDistance < minDistance) {
        minDistance = directionalDistance;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      set({ selectedIndex: bestIdx });
    }
  },
}));
