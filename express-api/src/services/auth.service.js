import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import prisma from '../lib/prisma.js';
import { config } from '../config/index.js';

const resend = new Resend(config.resendApiKey);

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateTokens(userId, email) {
  const payload = { id: userId, email };
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
  return { accessToken, refreshToken };
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function registerUser(email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  await sendOtp(user.id, email);
  return { message: 'Registered. Check your email for OTP.' };
}

export async function sendOtp(userId, email) {
  await prisma.otpCode.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  const code = String(crypto.randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + config.otpExpiresInMs);

  await prisma.otpCode.create({ data: { userId, code, expiresAt } });

  const { data, error } = await resend.emails.send({
    from: config.resendFrom,
    to: email,
    subject: 'Your APMA verification code',
    html: `<p>Your OTP is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  });

  console.log('[Resend] data:', JSON.stringify(data));
  console.log('[Resend] error:', JSON.stringify(error));

  if (error) {
    console.error('[Resend] Failed to send OTP:', error);
  }
}
export async function verifyOtp(email, code) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      code,
      used: false,
      expiresAt: { gt: new Date() }, // not expired
    },
  });

  if (!otp) {
    const err = new Error('Invalid or expired OTP');
    err.status = 400;
    throw err;
  }

  // Mark OTP used and user verified in a transaction — both or neither
  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } }),
    prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
  ]);

  return generateTokens(user.id, user.email);
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  if (!user.isVerified) {
    const err = new Error('Email not verified. Request a new OTP.');
    err.status = 403;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  return generateTokens(user.id, user.email);
}

export async function refreshTokens(refreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
  } catch {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return generateTokens(user.id, user.email);
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, isVerified: true, createdAt: true },
  });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
}
export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists or not — security best practice
    return { message: 'If that email exists, you will receive a reset code.' };
  }

  await sendOtp(user.id, email);
  return { message: 'If that email exists, you will receive a reset code.' };
}

export async function resetPassword(email, code, newPassword) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid or expired code');
    err.status = 400;
    throw err;
  }

  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) {
    const err = new Error('Invalid or expired code');
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
  prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } }),
  prisma.user.update({ where: { id: user.id }, data: { password: hashed, isVerified: true } }),
]);

  return { message: 'Password reset successfully.' };
}