#ifndef HWDEV_H
#define HWDEV_H

#include "rctTypes.h"

bool mlsag_prepare(const key &H, const key &xx, key &a, key &aG, key &aHP, key &rvII);
bool mlsag_prepare(key &a, key &aG);
bool mlsag_hash(const keyV &long_message, key &c);
bool mlsag_sign(const key &c, const keyV &xx, const keyV &alpha, const size_t rows, const size_t dsRows, keyV &ss);

#endif
