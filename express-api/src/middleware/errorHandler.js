export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Prisma unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  // Zod validation errors come through as ZodError
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Default 500
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}