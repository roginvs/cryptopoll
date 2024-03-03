# Monero code for MLSAG

Just copy-pasted code from Monero repository which is related to MLSAG

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

## Building CLI

```sh
sudo apt-get install nlohmann-json3-dev

mkdir build
cd build
cmake ..
make
./demo
```
