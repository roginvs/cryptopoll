cmake_minimum_required(VERSION 3.12)


project(mlsag)

if (${CMAKE_SYSTEM_NAME} STREQUAL "WASI")
  set(EXECUTABLE_NAME lib-mlsag)
else()
  set(EXECUTABLE_NAME demo)
endif()




# set(CMAKE_CXX_STANDARD 17)
# set(CMAKE_CXX_STANDARD_REQUIRED YES)

add_executable(${EXECUTABLE_NAME})


target_sources(${EXECUTABLE_NAME} PUBLIC
  "src/crypto.cpp"
  "src/hwdev.cpp"
  "src/keccak.cpp"
  "src/crypto-ops-data.cpp"
  "src/rctCryptoOps.cpp"
  "src/crypto-ops.cpp"
  "src/rctOps.cpp"
  "src/rctSigs.cpp"
  "src/crypto_verify_32.cpp"
  "src/memwipe.cpp"
)

if (${CMAKE_SYSTEM_NAME} STREQUAL "WASI")
  target_sources(${EXECUTABLE_NAME} PUBLIC
    "src/wasm.cpp"
  )
else()
  target_sources(${EXECUTABLE_NAME} PUBLIC
    "src/demo.cpp"
  )
endif()