// ---------------------------------------------------------------------------
// Watchtower — Zustand Store
// Combines graph and UI slices into a single store.
// ---------------------------------------------------------------------------

import { create, type StateCreator } from 'zustand';
import { createGraphSlice, type GraphSlice } from './graph-slice';
import { createUISlice, type UISlice } from './ui-slice';

// ---------------------------------------------------------------------------
// Combined store type
// ---------------------------------------------------------------------------

export type WatchtowerState = GraphSlice & UISlice;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWatchtowerStore = create<WatchtowerState>()((...a) => ({
  ...(createGraphSlice as StateCreator<WatchtowerState, [], [], GraphSlice>)(...a),
  ...(createUISlice as StateCreator<WatchtowerState, [], [], UISlice>)(...a),
}));

// Re-export slice interfaces for consumers
export type { GraphSlice } from './graph-slice';
export type { UISlice } from './ui-slice';
