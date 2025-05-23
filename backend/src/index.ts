import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import loanRoutes from './routes/loan.js';
import job from './utils/cron.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['https://loan-managemet.vercel.app','https://loan-managemet-git-main-ketan-bajpais-projects.vercel.app'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy" });
});

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/loan", loanRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
job.start();
// Start server
const PORT = process.env.PORT || 5000;
app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on port 5000");
});


// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and Prisma Client');
  await prisma.$disconnect();
  process.exit(0);
});
