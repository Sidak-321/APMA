import { z } from 'zod';
import * as projectsService from '../services/projects.service.js';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export async function createProject(req, res, next) {
  try {
    const body = createSchema.parse(req.body);
    const project = await projectsService.createProject(req.user.id, body.name, body.description);
    res.status(201).json(project);
  } catch (err) { next(err); }
}

export async function getProjects(req, res, next) {
  try {
    const projects = await projectsService.getProjects(req.user.id);
    res.json(projects);
  } catch (err) { next(err); }
}

export async function getProject(req, res, next) {
  try {
    const project = await projectsService.getProject(req.user.id, req.params.id);
    res.json(project);
  } catch (err) { next(err); }
}

export async function deleteProject(req, res, next) {
  try {
    await projectsService.deleteProject(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}