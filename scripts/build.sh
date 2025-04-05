#!/bin/bash

bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile unitool_bun_server_mac \
	./src/index.ts