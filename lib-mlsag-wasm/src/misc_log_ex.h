#ifndef _MISC_LOG_EX_H_
#define _MISC_LOG_EX_H_

#include <stdexcept>

#define ASSERT_MES_AND_THROW(message)      \
    {                                      \
        throw std::runtime_error(message); \
    }
#define CHECK_AND_ASSERT_THROW_MES(expr, message) \
    do                                            \
    {                                             \
        if (!(expr))                              \
            ASSERT_MES_AND_THROW(message);        \
    } while (0)

#define CHECK_AND_ASSERT_MES(expr, fail_ret_val, message) \
    do                                                    \
    {                                                     \
        if (!(expr))                                      \
        {                                                 \
            /* @TODO: Write a message somewhere */        \
            return fail_ret_val;                          \
        };                                                \
    } while (0)

#endif
