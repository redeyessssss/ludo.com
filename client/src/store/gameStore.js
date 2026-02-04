import { create } from 'zustand';

export const useGameStore = create((set) => ({
  gameState: null,
  players: [],
  currentTurn: null,
  diceValue: null,
  selectedToken: null,
  
  setGameState: (gameState) => set({ gameState }),
  setPlayers: (players) => set({ players }),
  setCurrentTurn: (currentTurn) => set({ currentTurn }),
  setDiceValue: (diceValue) => set({ diceValue }),
  setSelectedToken: (selectedToken) => set({ selectedToken }),
  
  resetGame: () => set({
    gameState: null,
    players: [],
    currentTurn: null,
    diceValue: null,
    selectedToken: null,
  }),
}));
