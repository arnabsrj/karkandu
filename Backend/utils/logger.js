// utils/logger.js
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. CHANGE: Use NODE_ENV to detect if we are in production (Vercel)
// If NODE_ENV is 'production', we assume we are on the server (Vercel)
const isProduction = process.env.NODE_ENV === 'production';

// Path for logs if running locally
const logsDir = path.join(__dirname, '../logs');

// 2. CHANGE: Only create directory if we are NOT in production
if (!isProduction) {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// Create Winston logger
const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: [
    // Always log to console (Required for Vercel Logs)
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),

    // 3. CHANGE: Only add File transports if NOT in production
    ...(!isProduction
      ? [
          new transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: format.json(),
          }),
          new transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: format.json(),
          }),
        ]
      : []),
  ],
  // Exception and rejection handlers
  exceptionHandlers: [
    isProduction
      ? new transports.Console()
      : new transports.File({ filename: path.join(logsDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    isProduction
      ? new transports.Console()
      : new transports.File({ filename: path.join(logsDir, 'rejections.log') }),
  ],
});

export default logger;