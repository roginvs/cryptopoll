#include "rctSigs.h"

static_assert(sizeof(key) == 32, "Key size");

key *allocate_keys(int keys_amount) __attribute__((export_name("allocate_keys")))
{
    return new key[keys_amount];
}
void free_keys(key *p) __attribute__((export_name("free_keys")))
{
    delete[] p;
}

void wasm_skGen(key *sk) __attribute__((export_name("skGen")))
{
    skGen(*sk);
};

void wasm_scalarmultBase(key *aG, const key *a) __attribute__((export_name("scalarmultBase")))
{

    scalarmultBase(*aG, *a);
}

/**
 * @brief
 * returns a pointer to [II, cc, ss1, ... , ssN ]
 */
key *LSAG_Signature(
    const key *message,
    const key *privateKey,
    const unsigned int public_keys_length,
    const key *public_keys)
    __attribute__((export_name("LSAG_Signature")))
{

    keyV xx{*privateKey};

    keyM pk;
    pk.resize(public_keys_length);
    int index = -1;

    key my_public_key;
    scalarmultBase(my_public_key, *privateKey);
    for (int i = 0; i < public_keys_length; i++)
    {
        pk[i].push_back(public_keys[i]);
        if (my_public_key == public_keys[i])
        {
            index = i;
        }
    };
    if (index == -1)
    {
        return 0;
    };

    auto signature = MLSAG_Gen(*message, pk, xx, index, 1);

    auto out = new key[public_keys_length + 2];
    out[0] = signature.II[0];
    out[1] = signature.cc;
    for (int i = 0; i < public_keys_length; i++)
    {
        out[i + 2] = signature.ss[i][0];
    }
    return out;
}

bool LSAG_Verify(
    const key *message,
    const unsigned int public_keys_length,
    const key *public_keys,
    const key *signature)
    __attribute__((export_name("LSAG_Verify")))
{
    keyM pk;
    pk.resize(public_keys_length);
    keyM ss;
    ss.resize(public_keys_length);

    for (int i = 0; i < public_keys_length; i++)
    {
        pk[i].push_back(public_keys[i]);
        ss[i].push_back(signature[i + 2]);
    };

    const mgSig sig = {
        .ss = ss,
        .cc = signature[1],
        .II = keyV{signature[0]},
    };

    auto result = MLSAG_Ver(*message, pk, sig, 1);
    return result;
}

void wasm_cn_fast_hash(key *hash, const void *data, const std::size_t l)
    __attribute__((export_name("cn_fast_hash")))
{
    cn_fast_hash(*hash, data, l);
}