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

/*
bool wasm_MLSAG_Ver(const key &message, const keyM &pk, const mgSig &sig, size_t dsRows)
{
    return MLSAG_Ver(message, pk, sig, dsRows);
}
*/

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
 * data is a pointer to keys: [message, privateKey, pubkey1, .... ,pubkeyN]
 * returns a pointer to [II, cc, ss1, ... , ssN ]
 */
key *LSAG_Signature(unsigned int public_keys_length, key *data) __attribute__((export_name("LSAG_Signature")))
{
    key &message = data[0];
    keyV xx{data[1]};

    keyM pk;
    pk.resize(public_keys_length);
    int index = -1;

    key my_public_key;
    scalarmultBase(my_public_key, data[1]);
    for (int i = 0; i < public_keys_length; i++)
    {
        pk[i].push_back(data[i + 2]);
        if (my_public_key == data[i + 2])
        {
            index = i;
        }
    };
    if (index == -1)
    {
        return 0;
    };

    auto signature = MLSAG_Gen(message, pk, xx, index, 1);

    auto out = new key[public_keys_length + 2];
    out[0] = signature.II[0];
    out[1] = signature.cc;
    for (int i = 0; i < public_keys_length; i++)
    {
        out[i + 2] = signature.ss[i + 2][0];
    }
    return out;
}
