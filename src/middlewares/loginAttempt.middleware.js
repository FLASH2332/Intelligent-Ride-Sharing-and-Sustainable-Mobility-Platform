import redisClient from '../config/redis.js';

/**
 * Track failed login attempts and block after threshold
 * Only blocks on FAILED attempts, not successful logins
 */

const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION = 10 * 60; // 10 minutes in seconds
const ATTEMPT_WINDOW = 10 * 60; // Track attempts for 10 minutes

/**
 * Check if IP/email is blocked before login
 */
export const checkLoginAttempts = async (req, res, next) => {
    try {
        const identifier = `${req.ip}_${req.body.email || 'unknown'}`;
        const blockKey = `login_block:${identifier}`;
        const attemptKey = `login_attempts:${identifier}`;

        // Check if currently blocked
        const isBlocked = await redisClient.get(blockKey);
        if (isBlocked) {
            const ttl = await redisClient.ttl(blockKey);
            return res.status(429).json({
                success: false,
                message: `Too many failed login attempts. Please try again in ${Math.ceil(ttl / 60)} minutes`,
                retryAfter: ttl
            });
        }

        // Get current attempt count
        const attempts = await redisClient.get(attemptKey);
        const attemptCount = parseInt(attempts) || 0;

        // Store attempt count in request for later use
        req.loginAttempts = attemptCount;
        req.loginIdentifier = identifier;

        next();
    } catch (error) {
        console.error('checkLoginAttempts error:', error);
        // Don't block the request if Redis fails
        next();
    }
};

/**
 * Record failed login attempt
 * Call this ONLY when login fails
 */
export const recordFailedLogin = async (identifier) => {
    try {
        const attemptKey = `login_attempts:${identifier}`;
        const blockKey = `login_block:${identifier}`;

        // Increment failed attempts
        const attempts = await redisClient.incr(attemptKey);
        
        // Set expiry on first attempt
        if (attempts === 1) {
            await redisClient.expire(attemptKey, ATTEMPT_WINDOW);
        }

        // Block if threshold exceeded
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            await redisClient.setex(blockKey, BLOCK_DURATION, 'blocked');
            await redisClient.del(attemptKey); // Clear attempts after blocking
            return {
                blocked: true,
                attempts,
                message: `Account temporarily locked due to ${MAX_FAILED_ATTEMPTS} failed attempts. Try again in ${BLOCK_DURATION / 60} minutes`
            };
        }

        return {
            blocked: false,
            attempts,
            remaining: MAX_FAILED_ATTEMPTS - attempts
        };
    } catch (error) {
        console.error('recordFailedLogin error:', error);
        return { blocked: false, attempts: 0 };
    }
};

/**
 * Clear failed attempts on successful login
 */
export const clearLoginAttempts = async (identifier) => {
    try {
        const attemptKey = `login_attempts:${identifier}`;
        await redisClient.del(attemptKey);
    } catch (error) {
        console.error('clearLoginAttempts error:', error);
    }
};
