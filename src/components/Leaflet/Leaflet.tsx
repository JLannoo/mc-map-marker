import { createRef, useEffect, type RefObject } from "react";

import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

import { ChunkGridLayer } from "../../lib/ChunkGridLayer/ChunkGridLayer";

import { create } from "zustand";

// ===== STORE =====
interface LeafletStore {
    map: leaflet.Map | null;
    containerRef: RefObject<HTMLDivElement | null>;

    setMap: (map: leaflet.Map) => void;
    setContainerRef: (container: RefObject<HTMLDivElement>) => void;
}

export const useLeafletStore = create<LeafletStore>((set) => ({
    map: null,
    setMap: (map: leaflet.Map) => set({ map }),

    containerRef: createRef<HTMLDivElement>(),
    setContainerRef: (containerRef: RefObject<HTMLDivElement>) => set({ containerRef }),
}));

// ===== COMPONENT =====
const TILE_LAYER = new ChunkGridLayer();
const MAP_CONFIG: leaflet.MapOptions = {
    crs: leaflet.CRS.Simple,
    maxZoom: 8,
    minZoom: 0,
};

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
        <div ref={containerRef} style={{ height: "100vh", width: "100vw" }}></div>
    );
}
