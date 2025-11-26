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
    // Console output only (safe for Vercel)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),
  ],
  // Remove file-based exception/rejection handlers
});

export default logger;
