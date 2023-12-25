#ifndef MISC_LANGUAGE_H
#define MISC_LANGUAGE_H

#include <boost/shared_ptr.hpp>

struct call_befor_die_base
{
    virtual ~call_befor_die_base() {}
};

typedef boost::shared_ptr<call_befor_die_base> auto_scope_leave_caller;

template <class t_scope_leave_handler>
struct call_befor_die : public call_befor_die_base
{
    t_scope_leave_handler m_func;
    call_befor_die(t_scope_leave_handler f) : m_func(f)
    {
    }
    ~call_befor_die()
    {
        try
        {
            m_func();
        }
        catch (...)
        { /* ignore */
        }
    }
};

template <class t_scope_leave_handler>
auto_scope_leave_caller create_scope_leave_handler(t_scope_leave_handler f)
{
    auto_scope_leave_caller slc(new call_befor_die<t_scope_leave_handler>(f));
    return slc;
}

#endif