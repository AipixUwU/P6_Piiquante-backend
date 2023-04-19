const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 100, // Limite 100 requêtes par IP toutes les 30 minutes
  message: "Trop de requêtes envoyé à partir de cette IP, réessayer plus tard",
});

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limite 5 requêtes par IP toutes les 1 minute
    message: "Trop de requêtes envoyé à partir de cette IP, réessayer plus tard",
});

module.exports = {
    generalLimiter,
    loginLimiter
};