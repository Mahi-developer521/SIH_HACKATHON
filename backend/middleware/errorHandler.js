function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
