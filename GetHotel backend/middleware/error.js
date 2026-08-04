const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.status || err.statusCode || 500;
    let message = err.message || 'An unexpected server error occurred.';

    // 1. JWT Errors
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your session has expired. Please login again.';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token. Please login again.';
    }
    
    // 2. Prisma Database Errors (Obfuscate query traces)
    else if (err.code && err.code.startsWith('P')) {
        statusCode = 400;
        if (err.code === 'P2002') {
            const field = err.meta?.target || 'field';
            message = `Constraint Violation: A record with this ${field} already exists.`;
        } else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'The requested resource could not be found.';
        } else {
            message = 'A database integrity violation occurred.';
        }
    }

    // 3. Structured Logging to logs/errors.log
    try {
        const logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
        const errorLog = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: ip.replace(/^::ffff:/, ''),
            headers: req.headers,
            error: {
                name: err.name,
                message: err.message,
                code: err.code,
                stack: err.stack
            }
        };

        fs.appendFileSync(path.join(logDir, 'errors.log'), JSON.stringify(errorLog) + '\n');
        console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl} | Error: ${err.message}`);
    } catch (logErr) {
        console.error('[CRITICAL] Failed to write error log file:', logErr);
    }

    // 4. Return sanitized client response
    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
