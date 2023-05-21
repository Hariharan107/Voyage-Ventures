const globalErrorHandler = (err, req, res, next) => { 
  if (!req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

export default globalErrorHandler;
