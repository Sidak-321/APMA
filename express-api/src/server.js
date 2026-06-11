import express from 'express';
import fs from 'fs';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import agentsRoutes from './routes/agents.routes.js';

if (!fs.existsSync('/tmp/uploads')) {
  fs.mkdirSync('/tmp/uploads', { recursive: true });
}

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'express-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/projects/:projectId/documents', documentsRoutes);
app.use('/api/projects/:projectId/runs', agentsRoutes);

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));
app.use(errorHandler);

app.listen(config.port, () => console.log(`Express API running on port ${config.port}`));