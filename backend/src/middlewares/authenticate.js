const { cookieName } = require("../config/authConfig");
const { publicUser } = require("../services/auth/authService");
const { getSession } = require("../services/auth/sessionService");

async function authenticate(req, res, next) {
  try {
    const session = await getSession(req.cookies?.[cookieName]);

    if (!session) {
      return res.status(401).json({ message: "Authentification requise." });
    }

    req.user = publicUser(session.user);
    req.authSession = { id: session.id, expiresAt: session.expiresAt };
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticate,
};