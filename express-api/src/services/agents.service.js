import prisma from '../lib/prisma.js';
import aiClient from '../lib/aiClient.js';

export async function createRun(userId, projectId, goal, outputType) {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  // Create run record immediately
  const run = await prisma.agentRun.create({
    data: { projectId, userId, goal, outputType, status: 'running' },
  });

  return run;
}

export async function updateRun(runId, data) {
  return prisma.agentRun.update({
    where: { id: runId },
    data,
  });
}

export async function getRuns(userId, projectId) {
  return prisma.agentRun.findMany({
    where: { projectId, userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRun(userId, runId) {
  const run = await prisma.agentRun.findFirst({
    where: { id: runId, userId },
  });
  if (!run) {
    const err = new Error('Run not found');
    err.status = 404;
    throw err;
  }
  return run;
}