import { useEffect } from 'react';

import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Override default leaflet styles to match shadcn/ui
import './leaflet.overrides.css';

import { ChunkGridLayer } from '../../lib/ChunkGridLayer/ChunkGridLayer';

import { Coords } from '@/lib/utils';
import { useLeafletStore } from '@/stores/LeafletStore';

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
			const coords = Coords.mapToWorld(e.latlng.lng, e.latlng.lat);
			setPointerPos(coords);
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
