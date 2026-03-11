import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

let globalLimiter;
let authLimiter;

if (process.env.NODE_ENV === 'test') {
    // Bypass rate limiters explicitly during integration tests to avoid redis mock issues
    globalLimiter = (req, res, next) => next();
    authLimiter = (req, res, next) => next();
} else {
    // Global rate limiter for most API routes (100 req per 15 minutes)
    globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
        }),
        message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
    });

    // Auth rate limiter - General protection (30 req per 15 minutes)
    // Note: Login attempts are tracked separately in loginAttempt.middleware
    authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
        }),
        message: { success: false, message: 'Too many authentication requests from this IP, please try again after 15 minutes' }
    });
}

export { globalLimiter, authLimiter };
