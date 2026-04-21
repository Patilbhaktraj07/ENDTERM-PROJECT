import { create } from 'zustand';

const loadFromStorage = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const useStockStore = create((set, get) => ({
  // Dark mode
  darkMode: loadFromStorage('stockApp_darkMode', false),
  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem('stockApp_darkMode', JSON.stringify(next));
    set({ darkMode: next });
  },

  // Watchlist
  watchlist: loadFromStorage('stockApp_watchlist', []),
  addToWatchlist: (ticker) => {
    const current = get().watchlist;
    if (!current.includes(ticker)) {
      const next = [...current, ticker];
      localStorage.setItem('stockApp_watchlist', JSON.stringify(next));
      set({ watchlist: next });
    }
  },
  removeFromWatchlist: (ticker) => {
    const next = get().watchlist.filter((t) => t !== ticker);
    localStorage.setItem('stockApp_watchlist', JSON.stringify(next));
    set({ watchlist: next });
  },
  isInWatchlist: (ticker) => get().watchlist.includes(ticker),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

export default useStockStore;
