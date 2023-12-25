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


FILES="crypto.cpp
hwdev.cpp
keccak.cpp
crypto-ops-data.cpp
rctCryptoOps.cpp
crypto-ops.cpp
rctOps.cpp
main.cpp
rctSigs.cpp
crypto_verify_32.cpp
memwipe.cpp
"

OBJECT_FILES=""

for f in $FILES; do
  echo Building $f
  clang++ $f -c -o build/$f.o
  OBJECT_FILES="$OBJECT_FILES build/$f.o"
done


echo "Linking"
clang++ $OBJECT_FILES -o build/main.bin
