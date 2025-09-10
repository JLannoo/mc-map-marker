import { createRef, useEffect, type RefObject } from 'react';

import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Override default leaflet styles to match shadcn/ui
import './leaflet.overrides.css';

import { ChunkGridLayer } from '../../lib/ChunkGridLayer/ChunkGridLayer';

import { create } from 'zustand';

interface LeafletStore {
    map: leaflet.Map | null;
    containerRef: RefObject<HTMLDivElement | null>;

    setMap: (map: leaflet.Map) => void;
}

/**
 * Store to manage the Leaflet map instance and its container reference.
 */
export const useLeafletStore = create<LeafletStore>((set) => ({
	map: null,
	setMap: (map: leaflet.Map) => set({ map }),

	containerRef: createRef<HTMLDivElement>(),
}));

// ===== COMPONENT =====
const TILE_LAYER = new ChunkGridLayer();
const MAP_CONFIG: leaflet.MapOptions = {
	crs: leaflet.CRS.Simple,
	maxZoom: 8,
	minZoom: 0,
};

/**
 * Leaflet map component that initializes the map and provides a container for it.
 * 
 * Generated using {@link ChunkGridLayer} to display map tiles.
 */
export default function Leaflet() {
	const { containerRef, setMap, map } = useLeafletStore();
    
	function initializeMap() {
		// Check if the map is already initialized (mostly for StrictMode in dev)
		if (containerRef?.current && !containerRef.current.hasChildNodes()) {
			const m = leaflet.map(containerRef.current, MAP_CONFIG)
				.setView([0,0], 0);
            
			TILE_LAYER.addTo(m);

			setMap(m);
		}

		return () => {
			if (containerRef) map?.remove();
		};
	}

	useEffect(initializeMap, []);

	return (
		<div ref={containerRef} style={{ height: '100vh', width: '100vw' }}></div>
	);
}
