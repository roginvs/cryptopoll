#include "hwdev.h"
#include "rctOps.h"
#include "misc_log_ex.h"

bool mlsag_prepare(const key &H, const key &xx,
                   key &a, key &aG, key &aHP, key &II)
{
    skpkGen(a, aG);
    scalarmultKey(aHP, H, a);
    scalarmultKey(II, H, xx);
    return true;
}

bool mlsag_prepare(key &a, key &aG)
{
    skpkGen(a, aG);
    return true;
}

bool mlsag_hash(const keyV &toHash, key &c_old)
{
    c_old = hash_to_scalar(toHash);
    return true;
}

bool mlsag_sign(const key &c, const keyV &xx, const keyV &alpha, const size_t rows, const size_t dsRows, keyV &ss)
{
    CHECK_AND_ASSERT_THROW_MES(dsRows <= rows, "dsRows greater than rows");
    CHECK_AND_ASSERT_THROW_MES(xx.size() == rows, "xx size does not match rows");
    CHECK_AND_ASSERT_THROW_MES(alpha.size() == rows, "alpha size does not match rows");
    CHECK_AND_ASSERT_THROW_MES(ss.size() == rows, "ss size does not match rows");
    for (size_t j = 0; j < rows; j++)
    {
        sc_mulsub(ss[j].bytes, c.bytes, xx[j].bytes, alpha[j].bytes);
    }
    return true;
}