import type { RequestHandler } from 'express';

/**
 * Forwards rejected async route-handler promises to Express error middleware.
 */
const asyncHandler = (handler: RequestHandler): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};

export default asyncHandler;
