import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import pino from 'pino';

import routes from './routes/index.js';

dotenv.config();

const app     = express();
const PORT    = process.env.PORT || 5001;
const IS_PROD = process.env.NODE_ENV === 'production';

const log = pino({
  level: IS_PROD ? 'info' : 'debug',
  ...(IS_PROD ? {} : { transport: { target: 'pino-pretty', options: { colorize: true } } }),
});

if (IS_PROD && !process.env.JWT_SECRET) {
  log.fatal('JWT_SECRET must be set in production. Refusing to start.');
  process.exit(1);
} else if (!process.env.JWT_SECRET) {
  log.warn('JWT_SECRET is not set — using an insecure default. Set it in server/.env before going to production.');
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// ── Database ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => log.info('MongoDB connected'))
  .catch((err) => { log.error({ err }, 'MongoDB connection error'); process.exit(1); });

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Start ─────────────────────────────────────────────────────────────────────
const BIND_HOST = IS_PROD ? '127.0.0.1' : '0.0.0.0';
app.listen(PORT, BIND_HOST, () =>
  log.info(`Makeventory API running on ${BIND_HOST}:${PORT}`)
);
