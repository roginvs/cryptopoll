#include "memwipe.h"

void *memwipe(void *ptr, size_t len)
{
    memset(ptr, 0, len);
    // @TODO: use memset_s
    return ptr;
}