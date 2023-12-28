#include "memwipe.h"

void secure_memclear(void *ptr, size_t size)
{
    volatile unsigned char *volatile_clear_ptr = (volatile unsigned char *)ptr;

    for (size_t i = 0; i < size; ++i)
    {
        volatile_clear_ptr[i] = 0;
    }
}

void *memwipe(void *ptr, size_t len)
{
    secure_memclear(ptr, len);
    return ptr;
}