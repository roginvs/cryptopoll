# Monero code for MLSAG

Just copy-pasted code from Monero repository which is related to MLSAG

## Building demo

```sh
mkdir build
cd build
cmake ..
make
./demo
```

## Builing webassembly library

First, install https://github.com/WebAssembly/wasi-sdk
Then:

```sh
mkdir build
cd build
cmake -DCMAKE_TOOLCHAIN_FILE=${WASI_SDK_PATH}/share/cmake/wasi-sdk.cmake ..
make
cp lib-mlsag.wasm ..
```
