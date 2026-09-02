const { cookieName, getCookieOptions } = require("../config/authConfig");
const { login } = require("../services/auth/authService");
const { revokeSession } = require("../services/auth/sessionService");

async function loginUser(req, res) {
  try {
    const result = await login(req.body?.email, req.body?.password);
    res.cookie(cookieName, result.token, getCookieOptions(result.expiresAt));
    return res.json({ user: result.user, expiresAt: result.expiresAt });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode === 401 ? error.message : "Connexion impossible.",
    });
  }
}

async function logoutUser(req, res, next) {
  try {
    await revokeSession(req.cookies?.[cookieName]);
    res.clearCookie(cookieName, getCookieOptions());
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

function getCurrentUser(req, res) {
  return res.json({ user: req.user, expiresAt: req.authSession.expiresAt });
}

module.exports = {
  getCurrentUser,
  loginUser,
  logoutUser,
};