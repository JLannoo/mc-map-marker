#include "../cubiomes/generator.h"
#include "../cubiomes/util.h"

#include "stdio.h"
#include "emscripten/emscripten.h"

int mapZoomLevel(int zoomLevel) {
    // Map zoom level to scale factor
    // Zoom Level: 0-1 -> Scale: 64
    // Zoom Level: 2-3-4 -> Scale: 16
    // Zoom Level: 5-6 -> Scale: 4
    // Zoom Level: 7-8 -> Scale: 1
    return zoomLevel <= 1 ? 64 :
           zoomLevel <= 4 ? 16 :
           zoomLevel <= 6 ? 4 : 1;
}

extern EMSCRIPTEN_KEEPALIVE
unsigned char* fetchChunkData(uint64_t seed, int chunkX, int chunkZ, int y, int pix4cell, int zoomLevel) {
    if(seed == 0){
        return NULL;
    }

    Generator generator;
    setupGenerator(&generator, MC_NEWEST, 0);

    applySeed(&generator, DIM_OVERWORLD, seed);

    Range range;
    // Possible scale values [1, 4, 16, 64]
    range.scale = mapZoomLevel(zoomLevel);

    // Chunk coordinates to block coordinates
    range.x = chunkX * 16;
    range.z = chunkZ * 16;

    // Generate a 16x16 area (1 chunk)
    range.sx = 16;
    range.sz = 16;

    // Y uses a scale of 4:1 except when range.scale = 1
    range.y = range.scale == 1 ? y : y / 4;
    range.sy = 1;

    int *biomeIds = allocCache(&generator, range);

    genBiomes(&generator, biomeIds, range);

    int imgWidth = range.sx * pix4cell;
    int imgHeight = range.sz * pix4cell;

    unsigned char biomeColors[256][3];
    initBiomeColors(biomeColors);

    unsigned char *rgb = (unsigned char*) malloc(3 * imgWidth * imgHeight);
    if(rgb == NULL) {
        fprintf(stderr, "Could not allocate image memory\n");
        free(biomeIds);
        return NULL;
    }
    // Flip the image vertically so that north is at the top
    biomesToImage(rgb, biomeColors, biomeIds, range.sx, range.sz, pix4cell, 1);

    free(biomeIds);
    
    return rgb;
}
