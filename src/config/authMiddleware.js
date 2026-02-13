function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "No autorizado. Inicia sesion." });
  }
  return next();
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "No autorizado. Inicia sesion." });
    }

    const { role } = req.session.user;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Prohibido para este rol." });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  authorizeRoles,
};
