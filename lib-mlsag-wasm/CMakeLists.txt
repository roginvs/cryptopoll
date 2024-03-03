cmake_minimum_required(VERSION 3.12)


project(mlsag)

if (${CMAKE_SYSTEM_NAME} STREQUAL WASI)
  set(EXECUTABLE_NAME lib-mlsag.wasm)
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

if (${CMAKE_SYSTEM_NAME} STREQUAL WASI)
  target_sources(${EXECUTABLE_NAME} PUBLIC
    "src/wasm.cpp"
  )
  target_link_options(${EXECUTABLE_NAME} PRIVATE -Wl,--allow-undefined,--stack-first)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -g -mbulk-memory -fignore-exceptions")
else()
  find_package(nlohmann_json 3.2.0 REQUIRED)
  #target_link_libraries(${EXECUTABLE_NAME} PRIVATE nlohmann_json::nlohmann_json)
  target_sources(${EXECUTABLE_NAME} PUBLIC
    "src/demo.cpp"
  )
endif()