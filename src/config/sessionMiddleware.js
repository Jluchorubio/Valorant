const session = require("express-session");

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "valorant_secret_dev",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 8,
  },
});

module.exports = sessionMiddleware;
