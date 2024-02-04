#ifndef MISC_LANGUAGE_H
#define MISC_LANGUAGE_H

#include <functional>
#include <memory>

// Define a class that will call a given function when leaving scope.
class ScopeLeaveHandler
{
public:
    // The constructor takes a std::function<void()> which is the function to be called on scope exit.
    explicit ScopeLeaveHandler(std::function<void()> onScopeLeave)
        : onScopeLeave_(onScopeLeave) {}

    // The destructor calls the function.
    ~ScopeLeaveHandler()
    {
        onScopeLeave_();
    }

    // Delete copy constructor and assignment operator to prevent copying.
    ScopeLeaveHandler(const ScopeLeaveHandler &) = delete;
    ScopeLeaveHandler &operator=(const ScopeLeaveHandler &) = delete;

private:
    std::function<void()> onScopeLeave_;
};

// create_scope_leave_handler is a function that creates a ScopeLeaveHandler.
static inline auto create_scope_leave_handler(std::function<void()> onScopeLeave)
{
    return std::make_unique<ScopeLeaveHandler>(onScopeLeave);
}

#endif