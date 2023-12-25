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

#ifndef RCTSIGS_H
#define RCTSIGS_H

#include <cstddef>
#include <vector>
#include <tuple>

#include "rctTypes.h"
#include "rctOps.h"

// Multilayered Spontaneous Anonymous Group Signatures (MLSAG signatures)
// These are aka MG signatutes in earlier drafts of the ring ct paper
//  c.f. https://eprint.iacr.org/2015/1098 section 2.
//  Gen creates a signature which proves that for some column in the keymatrix "pk"
//    the signer knows a secret key for each row in that column
//  Ver verifies that the MG sig was created correctly
mgSig MLSAG_Gen(const key &message, const keyM &pk, const keyV &xx, const unsigned int index, size_t dsRows);
bool MLSAG_Ver(const key &message, const keyM &pk, const mgSig &sig, size_t dsRows);

#endif /* RCTSIGS_H */
