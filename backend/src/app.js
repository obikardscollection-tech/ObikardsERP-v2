const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { frontendOrigin } = require("./config/authConfig");
const authRoutes = require("./routes/authRoutes");
const { authenticate } = require("./middlewares/authenticate");
const { originGuard } = require("./middlewares/originGuard");
const { enforceRouteAuthorization } = require("./middlewares/routeAuthorization");
const { registerBusinessRoutes } = require("./routes/registerBusinessRoutes");

function createApp() {
  const app = express();

  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      callback(null, !origin || origin === frontendOrigin);
    },
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(originGuard);

  app.get("/", (req, res) => {
    res.json({ app: "Obikards ERP", version: "0.1.0", status: "OK" });
  });
  app.use("/auth", authRoutes);
  app.use(authenticate);
  app.use(enforceRouteAuthorization);
  registerBusinessRoutes(app);

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  });

  return app;
}

module.exports = {
  createApp,
};