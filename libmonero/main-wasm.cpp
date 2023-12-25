#include "rctSigs.h"

mgSig wasm_MLSAG_Gen(const key &message,
                     const keyM &pk,
                     const keyV &xx,
                     const unsigned int index,
                     size_t dsRows)
    __attribute__((export_name("MLSAG_Gen")))
{
    return MLSAG_Gen(message, pk, xx, index, dsRows);
}
