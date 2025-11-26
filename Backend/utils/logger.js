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

// export default logger;
// utils/logger.js
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect if we are running in Vercel serverless environment
const isServerless = !!process.env.VERCEL;

// Path for logs if running locally
const logsDir = path.join(__dirname, '../logs');

// Ensure local logs folder exists
if (!isServerless) {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
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
  transports: [
    // Always log to console
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),

    // Only log to files if running locally
    ...(!isServerless
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
    isServerless
      ? new transports.Console()
      : new transports.File({ filename: path.join(logsDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    isServerless
      ? new transports.Console()
      : new transports.File({ filename: path.join(logsDir, 'rejections.log') }),
  ],
});

export default logger;
