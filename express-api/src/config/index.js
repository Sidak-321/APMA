export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: '1h',
  jwtRefreshExpiresIn: '7d',
  otpExpiresInMs: 10 * 60 * 1000, // 10 minutes
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM || 'noreply@apma.dev',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5001',
};