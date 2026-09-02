function authorize(...roles) {
  return function authorizeRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Authentification requise." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit." });
    }

    return next();
  };
}

module.exports = {
  authorize,
};