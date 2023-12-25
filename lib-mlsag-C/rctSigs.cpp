// Copyright (c) 2016-2023, Monero Research Labs
//
// Author: Shen Noether <shen.noether@gmx.com>
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//    conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//    of conditions and the following disclaimer in the documentation and/or other
//    materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//    used to endorse or promote products derived from this software without specific
//    prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

#include "misc_log_ex.h"
#include "misc_language.h"
#include "rctSigs.h"
#include "hwdev.h"
#include "memwipe.h"

using namespace std;

// MLSAG signatures
// See paper by Noether (https://eprint.iacr.org/2015/1098)
// This generalization allows for some dimensions not to require linkability;
//   this is used in practice for commitment data within signatures
// Note that using more than one linkable dimension is not recommended.
mgSig MLSAG_Gen(const key &message, const keyM &pk, const keyV &xx, const unsigned int index, size_t dsRows)
{
    mgSig rv;
    size_t cols = pk.size();
    CHECK_AND_ASSERT_THROW_MES(cols >= 2, "Error! What is c if cols = 1!");
    CHECK_AND_ASSERT_THROW_MES(index < cols, "Index out of range");
    size_t rows = pk[0].size();
    CHECK_AND_ASSERT_THROW_MES(rows >= 1, "Empty pk");
    for (size_t i = 1; i < cols; ++i)
    {
        CHECK_AND_ASSERT_THROW_MES(pk[i].size() == rows, "pk is not rectangular");
    }
    CHECK_AND_ASSERT_THROW_MES(xx.size() == rows, "Bad xx size");
    CHECK_AND_ASSERT_THROW_MES(dsRows <= rows, "Bad dsRows size");

    size_t i = 0, j = 0, ii = 0;
    key c, c_old, L, R, Hi;
    ge_p3 Hi_p3;
    sc_0(c_old.bytes);
    vector<geDsmp> Ip(dsRows);
    rv.II = keyV(dsRows);
    keyV alpha(rows);
    auto wiper = create_scope_leave_handler([&]()
                                            { memwipe(alpha.data(), alpha.size() * sizeof(alpha[0])); });
    keyV aG(rows);
    rv.ss = keyM(cols, aG);
    keyV aHP(dsRows);
    keyV toHash(1 + 3 * dsRows + 2 * (rows - dsRows));
    toHash[0] = message;
    // DP("here1");
    for (i = 0; i < dsRows; i++)
    {
        toHash[3 * i + 1] = pk[index][i];
        hash_to_p3(Hi_p3, pk[index][i]);
        ge_p3_tobytes(Hi.bytes, &Hi_p3);
        mlsag_prepare(Hi, xx[i], alpha[i], aG[i], aHP[i], rv.II[i]);
        toHash[3 * i + 2] = aG[i];
        toHash[3 * i + 3] = aHP[i];
        precomp(Ip[i].k, rv.II[i]);
    }
    size_t ndsRows = 3 * dsRows; // non Double Spendable Rows (see identity chains paper)
    for (i = dsRows, ii = 0; i < rows; i++, ii++)
    {
        skpkGen(alpha[i], aG[i]); // need to save alphas for later..
        toHash[ndsRows + 2 * ii + 1] = pk[index][i];
        toHash[ndsRows + 2 * ii + 2] = aG[i];
    }

    mlsag_hash(toHash, c_old);

    i = (index + 1) % cols;
    if (i == 0)
    {
        copy(rv.cc, c_old);
    }
    while (i != index)
    {

        rv.ss[i] = skvGen(rows);
        sc_0(c.bytes);
        for (j = 0; j < dsRows; j++)
        {
            addKeys2(L, rv.ss[i][j], c_old, pk[i][j]);
            hash_to_p3(Hi_p3, pk[i][j]);
            ge_p3_tobytes(Hi.bytes, &Hi_p3);
            addKeys3(R, rv.ss[i][j], Hi, c_old, Ip[j].k);
            toHash[3 * j + 1] = pk[i][j];
            toHash[3 * j + 2] = L;
            toHash[3 * j + 3] = R;
        }
        for (j = dsRows, ii = 0; j < rows; j++, ii++)
        {
            addKeys2(L, rv.ss[i][j], c_old, pk[i][j]);
            toHash[ndsRows + 2 * ii + 1] = pk[i][j];
            toHash[ndsRows + 2 * ii + 2] = L;
        }
        mlsag_hash(toHash, c);
        copy(c_old, c);
        i = (i + 1) % cols;

        if (i == 0)
        {
            copy(rv.cc, c_old);
        }
    }
    mlsag_sign(c, xx, alpha, rows, dsRows, rv.ss[index]);
    return rv;
}

// MLSAG signatures
// See paper by Noether (https://eprint.iacr.org/2015/1098)
// This generalization allows for some dimensions not to require linkability;
//   this is used in practice for commitment data within signatures
// Note that using more than one linkable dimension is not recommended.
bool MLSAG_Ver(const key &message, const keyM &pk, const mgSig &rv, size_t dsRows)
{
    size_t cols = pk.size();
    CHECK_AND_ASSERT_MES(cols >= 2, false, "Signature must contain more than one public key");
    size_t rows = pk[0].size();
    CHECK_AND_ASSERT_MES(rows >= 1, false, "Bad total row number");
    for (size_t i = 1; i < cols; ++i)
    {
        CHECK_AND_ASSERT_MES(pk[i].size() == rows, false, "Bad public key matrix dimensions");
    }
    CHECK_AND_ASSERT_MES(rv.II.size() == dsRows, false, "Wrong number of key images present");
    CHECK_AND_ASSERT_MES(rv.ss.size() == cols, false, "Bad scalar matrix dimensions");
    for (size_t i = 0; i < cols; ++i)
    {
        CHECK_AND_ASSERT_MES(rv.ss[i].size() == rows, false, "Bad scalar matrix dimensions");
    }
    CHECK_AND_ASSERT_MES(dsRows <= rows, false, "Non-double-spend rows cannot exceed total rows");

    for (size_t i = 0; i < rv.ss.size(); ++i)
    {
        for (size_t j = 0; j < rv.ss[i].size(); ++j)
        {
            CHECK_AND_ASSERT_MES(sc_check(rv.ss[i][j].bytes) == 0, false, "Bad signature scalar");
        }
    }
    CHECK_AND_ASSERT_MES(sc_check(rv.cc.bytes) == 0, false, "Bad initial signature hash");

    size_t i = 0, j = 0, ii = 0;
    key c, L, R;
    key c_old = copy(rv.cc);
    vector<geDsmp> Ip(dsRows);
    for (i = 0; i < dsRows; i++)
    {
        CHECK_AND_ASSERT_MES(!(rv.II[i] == identity()), false, "Bad key image");
        precomp(Ip[i].k, rv.II[i]);
        // @TODO: Check that rv.II[i]*groupSize = zero
    }
    size_t ndsRows = 3 * dsRows; // number of dimensions not requiring linkability
    keyV toHash(1 + 3 * dsRows + 2 * (rows - dsRows));
    toHash[0] = message;
    i = 0;
    while (i < cols)
    {
        sc_0(c.bytes);
        for (j = 0; j < dsRows; j++)
        {
            addKeys2(L, rv.ss[i][j], c_old, pk[i][j]);

            // Compute R directly
            ge_p3 hash8_p3;
            hash_to_p3(hash8_p3, pk[i][j]);
            ge_p2 R_p2;
            ge_double_scalarmult_precomp_vartime(&R_p2, rv.ss[i][j].bytes, &hash8_p3, c_old.bytes, Ip[j].k);
            ge_tobytes(R.bytes, &R_p2);

            toHash[3 * j + 1] = pk[i][j];
            toHash[3 * j + 2] = L;
            toHash[3 * j + 3] = R;
        }
        for (j = dsRows, ii = 0; j < rows; j++, ii++)
        {
            addKeys2(L, rv.ss[i][j], c_old, pk[i][j]);
            toHash[ndsRows + 2 * ii + 1] = pk[i][j];
            toHash[ndsRows + 2 * ii + 2] = L;
        }
        c = hash_to_scalar(toHash);
        CHECK_AND_ASSERT_MES(!(c == zero()), false, "Bad signature hash");
        copy(c_old, c);
        i = (i + 1);
    }
    sc_sub(c.bytes, c_old.bytes, rv.cc.bytes);
    return sc_isnonzero(c.bytes) == 0;
}

// proveRange and verRange
