import express from 'express';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(express.json());

// Health check — Docker and Railway use this
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'express-api' }));

// Routes
app.use('/api/auth', authRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler must be last
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Express API running on port ${config.port}`);
});