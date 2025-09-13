import { type RefObject, createRef } from 'react';
import type leaflet from 'leaflet';

import { create } from 'zustand';

interface LeafletStore {
    map: leaflet.Map | null;
    containerRef: RefObject<HTMLDivElement | null>;

    pointerPos: { x: number; z: number } | null;
    setPointerPos: (pos: { x: number; z: number } | null) => void;

    setMap: (map: leaflet.Map) => void;
}

/**
 * Store to manage the Leaflet map instance and its container reference.
 */
export const useLeafletStore = create<LeafletStore>((set) => ({
	map: null,
	setMap: (map: leaflet.Map) => set({ map }),

	pointerPos: null,
	setPointerPos: (pos: { x: number; z: number } | null) => set({ pointerPos: pos }),

	containerRef: createRef<HTMLDivElement>(),
}));