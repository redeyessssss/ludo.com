import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  // Theme settings
  boardTheme: 'classic', // classic, neon, wood, dark
  tokenSkin: 'default', // default, animals, emojis, shapes
  soundEnabled: true,
  
  // Available themes
  themes: {
    classic: {
      name: 'Classic',
      boardBg: 'bg-white',
      cellBg: 'bg-gray-100',
      pathBg: 'bg-yellow-100',
      homeBg: 'bg-gradient-to-br',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300',
    },
    neon: {
      name: 'Neon',
      boardBg: 'bg-gray-900',
      cellBg: 'bg-gray-800',
      pathBg: 'bg-purple-900',
      homeBg: 'bg-gradient-to-br',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500',
      glow: true,
    },
    wood: {
      name: 'Wood',
      boardBg: 'bg-amber-100',
      cellBg: 'bg-amber-200',
      pathBg: 'bg-amber-300',
      homeBg: 'bg-gradient-to-br',
      textColor: 'text-amber-900',
      borderColor: 'border-amber-600',
    },
    dark: {
      name: 'Dark Mode',
      boardBg: 'bg-gray-800',
      cellBg: 'bg-gray-700',
      pathBg: 'bg-gray-600',
      homeBg: 'bg-gradient-to-br',
      textColor: 'text-gray-100',
      borderColor: 'border-gray-500',
    },
  },
  
  // Token skins
  tokenSkins: {
    default: {
      name: 'Classic',
      red: '🔴',
      green: '🟢',
      blue: '🔵',
      yellow: '🟡',
    },
    animals: {
      name: 'Animals',
      red: '🦁',
      green: '🐸',
      blue: '🐋',
      yellow: '🐥',
    },
    emojis: {
      name: 'Emojis',
      red: '😈',
      green: '🤢',
      blue: '🥶',
      yellow: '😎',
    },
    shapes: {
      name: 'Shapes',
      red: '♦️',
      green: '♣️',
      blue: '♠️',
      yellow: '⭐',
    },
  },
  
  // Actions
  setBoardTheme: (theme) => {
    set({ boardTheme: theme });
    localStorage.setItem('boardTheme', theme);
  },
  
  setTokenSkin: (skin) => {
    set({ tokenSkin: skin });
    localStorage.setItem('tokenSkin', skin);
  },
  
  toggleSound: () => {
    set((state) => {
      const newValue = !state.soundEnabled;
      localStorage.setItem('soundEnabled', newValue);
      return { soundEnabled: newValue };
    });
  },
  
  // Load from localStorage
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const boardTheme = localStorage.getItem('boardTheme') || 'classic';
      const tokenSkin = localStorage.getItem('tokenSkin') || 'default';
      const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
      set({ boardTheme, tokenSkin, soundEnabled });
    }
  },
}));
