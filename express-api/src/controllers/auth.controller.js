import { z } from 'zod';
import * as authService from '../services/auth.service.js';

// Zod schemas — validate incoming request bodies
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// Controllers are thin — parse/validate input, call service, return response

export async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.registerUser(body.email, body.password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const body = verifyOtpSchema.parse(req.body);
    const tokens = await authService.verifyOtp(body.email, body.code);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);
    const tokens = await authService.loginUser(body.email, body.password);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const body = refreshSchema.parse(req.body);
    const tokens = await authService.refreshTokens(body.refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    // req.user.id is set by verifyJWT middleware
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}