// ---------------------------------------------------------------------------
// Watchtower — UI Slice (Zustand)
// Manages UI state: selection, view toggles.
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';

// ---------------------------------------------------------------------------
// UISlice interface
// ---------------------------------------------------------------------------

export interface UISlice {
  selectedNodeId: string | null;
  showMiniMap: boolean;
  showControls: boolean;

  setSelectedNode: (id: string | null) => void;
  toggleMiniMap: () => void;
  toggleControls: () => void;
}

// ---------------------------------------------------------------------------
// Slice creator
// ---------------------------------------------------------------------------

export const createUISlice: StateCreator<UISlice> = (set) => ({
  selectedNodeId: null,
  showMiniMap: true,
  showControls: true,

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),
  toggleControls: () => set((state) => ({ showControls: !state.showControls })),
});
