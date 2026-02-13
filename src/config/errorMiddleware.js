function notFoundHandler(req, res) {
  return res.status(404).json({ message: "Endpoint no encontrado." });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor.";
  return res.status(statusCode).json({ message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
