.PHONY: all cubiomes wasm

all: cubiomes wasm

ifeq ($(EMSCRIPTEN),1)
	CC = emcc
	AR = emar
	RM = rm
	override LDFLAGS=
endif

wasm: EMSCRIPTEN=1
wasm: CFLAGS += -O3

FILENAME = wasm/cubiomes

cubiomes:
	if [ ! -d "cubiomes" ]; then echo "Cubiomes submodule not found! Please run 'git submodule update --init --recursive'."; exit 1; fi
	$(MAKE) -C cubiomes
	
# Target depends on cubiomes being built first
wasm: cubiomes
# Step 1 - Compile with headers from static lib
	emcc -O3 -I cubiomes -c -o $(FILENAME).o $(FILENAME).c
# Step 2 - Link with static lib
# Step 3 - Export runtime methods, HEAPU8 for memory access, ccall for calling C functions
# Step 4 - Allow memory growth (optional, but useful for dynamic memory needs)
	emcc -O3 -o ./public/$(FILENAME).js $(FILENAME).o cubiomes/libcubiomes.a \
		-s EXPORTED_RUNTIME_METHODS='["HEAPU8", "ccall"]' \
		-s EXPORT_NAME='CubiomesCreateModule' \
		-s MODULARIZE=1 \
		-s ALLOW_MEMORY_GROWTH=1

clean:
	$(RM) -f wasm/*.o public/$(FILENAME).mjs
	$(MAKE) -C cubiomes clean