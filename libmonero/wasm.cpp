#include "rctSigs.h"

bool wasm_MLSAG_Ver(const key &message, const keyM &pk, const mgSig &sig, size_t dsRows)
{
    return MLSAG_Ver(message, pk, sig, dsRows);
}

mgSig wasm_MLSAG_Gen(const key &message,
                     const keyM &pk,
                     const keyV &xx,
                     const unsigned int index,
                     size_t dsRows)
    __attribute__((export_name("MLSAG_Gen")))
{
    return MLSAG_Gen(message, pk, xx, index, dsRows);
}
