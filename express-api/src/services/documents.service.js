import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma.js';
import aiClient from '../lib/aiClient.js';

export async function uploadDocument(userId, projectId, file) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const fileType = path.extname(file.originalname).replace('.', '').toLowerCase();

  const document = await prisma.document.create({
    data: { projectId, userId, filename: file.originalname, fileType, status: 'pending' },
  });

  // fire and forget
  embedDocument(document.id, projectId, userId, file.path, fileType).catch(
    (err) => console.error(`Embed failed for doc ${document.id}:`, err.message)
  );

  return document;
}

async function embedDocument(documentId, projectId, userId, filePath, fileType) {
  try {
    // Read file and send as base64 — no shared filesystem needed
    const fileBuffer = fs.readFileSync(filePath);
    const fileBase64 = fileBuffer.toString('base64');

    const response = await aiClient.post('/embed', {
      document_id: documentId,
      project_id: projectId,
      user_id: userId,
      file_base64: fileBase64,
      file_type: fileType,
    });

    // Clean up temp file after sending
    fs.unlinkSync(filePath);

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'ready', chunkCount: response.data.chunk_count },
    });
  } catch (err) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'failed' },
    });
    throw err;
  }
}

export async function getDocuments(userId, projectId) {
  return prisma.document.findMany({
    where: { projectId, userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDocument(userId, documentId) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });
  if (!doc) {
    const err = new Error('Document not found');
    err.status = 404;
    throw err;
  }
  return doc;
}