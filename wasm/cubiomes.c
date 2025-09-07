#include "../cubiomes/generator.h"
#include "../cubiomes/util.h"

#include "stdio.h"
#include "emscripten/emscripten.h"

extern EMSCRIPTEN_KEEPALIVE
unsigned char* fetchChunkData(uint64_t seed, int chunkX, int chunkZ, int y, int pix4cell) {
    if(seed == 0){
        return NULL;
    }

    Generator generator;
    setupGenerator(&generator, MC_NEWEST, 0);

    applySeed(&generator, DIM_OVERWORLD, seed);

    Range range;
    range.scale = 16;
    range.x = chunkX * 16;
    range.z = chunkZ * 16;
    range.sx = 16;
    range.sz = 16;
    range.y = y;
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
    biomesToImage(rgb, biomeColors, biomeIds, range.sx, range.sz, pix4cell, 0);

    free(biomeIds);
    
    return rgb;
}