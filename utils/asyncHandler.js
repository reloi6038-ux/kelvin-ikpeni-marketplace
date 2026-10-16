/**
 * asyncHandler
 * ------------
 * Wraps async route handlers so that any rejected promise
 * is automatically forwarded to Express's error handler.
 * Without this, you'd need try/catch in every controller.
 *
 * Usage:
 *   router.get('/x', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};