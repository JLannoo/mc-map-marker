import { createRef, useEffect, type RefObject } from 'react';

import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Override default leaflet styles to match shadcn/ui
import './leaflet.overrides.css';

import { ChunkGridLayer } from '../../lib/ChunkGridLayer/ChunkGridLayer';

import { create } from 'zustand';
import { Coords } from '@/lib/utils';

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
	const { containerRef, setMap, map, setPointerPos } = useLeafletStore();
    
	function initializeMap() {
		// Check if the map is already initialized (mostly for StrictMode in dev)
		if (containerRef?.current && !containerRef.current.hasChildNodes()) {
			const m = leaflet.map(containerRef.current, MAP_CONFIG)
				.setView([0,0], 4);
            
			TILE_LAYER.addTo(m);

			setMap(m);
		}

		return () => {
			if (containerRef) map?.remove();
		};
	}

	useEffect(initializeMap, []);
	useEffect(() => {
		if (!map) return;
		const onMouseMove = (e: leaflet.LeafletMouseEvent) => {
			const latLng = e.latlng;
			setPointerPos(Coords.mapToWorld(latLng.lng, latLng.lat));
		};

		map.on('mousemove', onMouseMove);

		return () => {
			map.off('mousemove', onMouseMove);
		};
	}, [map]);

	return (
		<div ref={containerRef} style={{ height: '100vh', width: '100vw' }}></div>
	);
}
