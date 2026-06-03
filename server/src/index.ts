import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { initCleanupCron } from './cron/taskCleanup.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import userRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.get('/', (req, res) => {
  res.send('Serenity API is running');
});
initCleanupCron();
app.listen(env.PORT,'0.0.0.0', () => {
  console.log(`Server is running on port ${env.PORT}`);
  console.log('ENV URL:', env.DATABASE_URL);
  console.log('TYPE:', typeof env.DATABASE_URL);
});
