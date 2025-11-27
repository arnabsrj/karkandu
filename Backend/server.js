
// server.js
import express from 'express';
import dotenv from 'dotenv';
import path from "path";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'colors'; // Optional: for colored logs
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Import Routes
import userRoutes from './routes/user/index.js';
import adminRoutes from './routes/admin/index.js';


import cookieParser from 'cookie-parser';


// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB(); // ← Using top-level await (ESM)
console.log("Server is starting...");
const app = express();

// === Security & Logging ===
app.use(cookieParser());

// app.use(  
//   cors({
//     origin: process.env.CLIENT_URL,
//     // || 'http://localhost:3000
//     credentials: true, // Allow cookies
//   })
// );


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://karkandu-frontend.vercel.app",
      "https://karkandu-frontend-22hxg2nj3-varnabs-projects.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);



// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//   })
// );
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan('dev'));

// === Body Parsing ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// === API Routes ===
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:5173");
  next();
}, express.static(path.join(process.cwd(), "uploads")));



// === Health Check ===
app.get('/', (req, res) => {
  
  res.json({
    success: true,
    message: 'Spiritual Blog API is Running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`.yellow);
  console.log(`API: http://localhost:${PORT}`.cyan);
  console.log(`Health: http://localhost:${PORT}/`.green);
});