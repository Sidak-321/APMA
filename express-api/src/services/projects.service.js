import prisma from '../lib/prisma.js';

export async function createProject(userId, name, description) {
  return prisma.project.create({
    data: { userId, name, description },
  });
}

export async function getProjects(userId) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { documents: true, agentRuns: true } },
    },
  });
}

export async function getProject(userId, projectId) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  return project;
}

export async function deleteProject(userId, projectId) {
  await getProject(userId, projectId);
  return prisma.project.delete({ where: { id: projectId } });
}