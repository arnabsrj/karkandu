// // utils/logger.js
// import { createLogger, format, transports } from 'winston';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Fix __dirname in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const logger = createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   format: format.combine(
//     format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     format.errors({ stack: true }),
//     format.printf(({ timestamp, level, message, stack }) => {
//       return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
//     })
//   ),
//   transports: [
//     // Console output
//     new transports.Console({
//       format: format.combine(
//         format.colorize(),
//         format.simple()
//       ),
//     }),

//     // Error log file
//     new transports.File({
//       filename: path.join(__dirname, '../logs/error.log'),
//       level: 'error',
//       format: format.json(),
//     }),

//     // Combined log file
//     new transports.File({
//       filename: path.join(__dirname, '../logs/combined.log'),
//       format: format.json(),
//     }),
//   ],
//   exceptionHandlers: [
//     new transports.File({ filename: path.join(__dirname, '../logs/exceptions.log') }),
//   ],
//   rejectionHandlers: [
//     new transports.File({ filename: path.join(__dirname, '../logs/rejections.log') }),
//   ],
// });

import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for logs
const logsDir = path.join(__dirname, '../logs');

// --- ROBUST FILESYSTEM CHECK ---
// We try to create the directory. If it fails (ReadOnly FS), we disable file logging.
let canWriteToDisk = false;

try {
  // If we are NOT in production, try to setup logs
  if (process.env.NODE_ENV !== 'production') {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    // If we reached here without error, we have write permissions
    canWriteToDisk = true;
  }
} catch (error) {
  // If we catch an error, we are in a Read-Only environment (like Vercel)
  console.warn("Read-only file system detected. File logging disabled.");
  canWriteToDisk = false;
}

// Define the transports based on the check above
const activeTransports = [
  // Always log to console
  new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
  }),
];

// Only add File transports if the disk check passed
if (canWriteToDisk) {
  activeTransports.push(
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: format.json(),
    }),
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: format.json(),
    })
  );
}

// Create Winston logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: activeTransports,
  // Only use file exception handlers if we can write to disk
  exceptionHandlers: canWriteToDisk
    ? [new transports.File({ filename: path.join(logsDir, 'exceptions.log') })]
    : [],
  rejectionHandlers: canWriteToDisk
    ? [new transports.File({ filename: path.join(logsDir, 'rejections.log') })]
    : [],
});

export default logger;