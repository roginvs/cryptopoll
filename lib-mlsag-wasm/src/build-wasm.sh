#!/bin/bash
set -e

mkdir -p build

for f in build/*.o; do
  if [ -f $f ]; then
    rm $f
  fi
done
if [ -f build/main.bin ]; then
  rm build/main.bin
fi
if [ -f build/main.wasm ]; then
  rm build/main.wasm
fi

FILES="crypto.cpp
hwdev.cpp
keccak.cpp
crypto-ops-data.cpp
rctCryptoOps.cpp
crypto-ops.cpp
rctOps.cpp
wasm.cpp
rctSigs.cpp
crypto_verify_32.cpp
memwipe.cpp
"

OBJECT_FILES=""

for f in $FILES; do
  echo Building $f
  /home/vasilii/wasi-sdk-21.0/bin/clang++ -g -c --target=wasm32-unknown-wasi \
   -mbulk-memory \
   -fignore-exceptions \
   --sysroot /home/vasilii/wasi-sdk-21.0/share/wasi-sysroot -o build/$f.wasm.o $f
  OBJECT_FILES="$OBJECT_FILES build/$f.wasm.o"
done


echo "Linking"
/home/vasilii/wasi-sdk-21.0/bin/clang++ -g $OBJECT_FILES  \
  -Wl,--allow-undefined,--stack-first,--no-entry \
  --sysroot /home/vasilii/wasi-sdk-21.0/share/wasi-sysroot \
  -o build/main.wasm

echo "Compilation is done"

wasm2wat --enable-all --inline-imports --fold-exprs --inline-exports build/main.wasm | grep import

cp build/main.wasm ../lib.wasm