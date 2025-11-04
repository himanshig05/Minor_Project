'use strict';

function requireAppKey() {
  const requiredKey = process.env.APP_API_KEY;
  // If no app key configured, middleware is a no-op
  if (!requiredKey) return (_req, _res, next) => next();

  return (req, res, next) => {
    const provided = req.header('X-App-Key') || req.header('x-app-key');
    if (!provided || provided !== requiredKey) {
      return res.status(401).json({ error: 'Unauthorized: missing or invalid X-App-Key' });
    }
    next();
  };
}

module.exports = { requireAppKey };