'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); //security reasons in http headers
const rateLimit = require('express-rate-limit'); //how many requests one client can make (dos se bachane ke liye)
const verifyRouter = require('./routes/verify');
const mediaRouter = require('./routes/media');
const urlRouter = require('./routes/url');
const { requireAppKey } = require('./middleware/appKey');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  const limiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
  app.use(limiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // App-level API key gate (no-op if APP_API_KEY is not set)
  app.use('/api', requireAppKey());

  app.use('/api', verifyRouter);
  app.use('/api', mediaRouter);
  app.use('/api', urlRouter);

  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  });

  return app;
}

module.exports = { createApp };

