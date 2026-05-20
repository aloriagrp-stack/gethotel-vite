const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    // Log to console for dev
    console.log(err.stack);

    // Prisma Unique Constraint Violation
    if (err.code === 'P2002') {
        const message = `Duplicate field value entered: ${err.meta?.target || 'field'}`;
        error = { message, statusCode: 400 };
    }

    // Prisma Not Found
    if (err.code === 'P2025') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
    });
};

module.exports = errorHandler;
