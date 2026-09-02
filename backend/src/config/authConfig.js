const SESSION_TTL_HOURS = Number(process.env.AUTH_SESSION_TTL_HOURS || 12);

if (!Number.isFinite(SESSION_TTL_HOURS) || SESSION_TTL_HOURS <= 0) {
  throw new Error("AUTH_SESSION_TTL_HOURS doit être un nombre positif.");
}

const cookieName = process.env.AUTH_COOKIE_NAME || "obikards_session";
const secureCookie = process.env.AUTH_COOKIE_SECURE === "true"
  || process.env.NODE_ENV === "production";

function getCookieOptions(expiresAt) {
  const options = {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
  };

  if (expiresAt) options.expires = expiresAt;
  return options;
}

module.exports = {
  cookieName,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  sessionTtlMs: SESSION_TTL_HOURS * 60 * 60 * 1000,
  getCookieOptions,
};