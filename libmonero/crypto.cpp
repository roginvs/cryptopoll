#include "crypto.h"
#include <stdint.h>
#include "crypto-ops.h"
#include <err.h>
#include <errno.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>

static inline void *padd(void *p, size_t i)
{
    return (char *)p + i;
}

void generate_random_bytes_thread_safe(size_t n, void *result)
{
    int fd;
    if ((fd = open("/dev/urandom", O_RDONLY | O_NOCTTY | O_CLOEXEC)) < 0)
    {
        err(EXIT_FAILURE, "open /dev/urandom");
    }
    for (;;)
    {
        ssize_t res = read(fd, result, n);
        if ((size_t)res == n)
        {
            break;
        }
        if (res < 0)
        {
            if (errno != EINTR)
            {
                err(EXIT_FAILURE, "read /dev/urandom");
            }
        }
        else if (res == 0)
        {
            errx(EXIT_FAILURE, "read /dev/urandom: end of file");
        }
        else
        {
            result = padd(result, (size_t)res);
            n -= (size_t)res;
        }
    }
    if (close(fd) < 0)
    {
        err(EXIT_FAILURE, "close /dev/urandom");
    }
}

static inline bool less32(const unsigned char *k0, const unsigned char *k1)
{
    for (int n = 31; n >= 0; --n)
    {
        if (k0[n] < k1[n])
            return true;
        if (k0[n] > k1[n])
            return false;
    }
    return false;
}

void random32_unbiased(unsigned char *bytes)
{
    // l = 2^252 + 27742317777372353535851937790883648493.
    // l fits 15 times in 32 bytes (iow, 15 l is the highest multiple of l that fits in 32 bytes)
    static const unsigned char limit[32] = {0xe3, 0x6a, 0x67, 0x72, 0x8b, 0xce, 0x13, 0x29, 0x8f, 0x30, 0x82, 0x8c, 0x0b, 0xa4, 0x10, 0x39, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0};
    while (1)
    {
        generate_random_bytes_thread_safe(32, bytes);
        if (!less32(bytes, limit))
            continue;
        sc_reduce32(bytes);
        if (sc_isnonzero(bytes))
            break;
    }
}