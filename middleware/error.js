const notFound = (req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
};

const handleError = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || 'Server Error' });
};

module.exports = { notFound, handleError };
