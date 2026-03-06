import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../db/models';
import { ApiError } from '../middleware/error-handler';
import type { LoginInput, RefreshInput, SignUpInput } from '../validators/auth.validator';

const SALT_ROUNDS = 10;

function getJwtConfig() {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set');
  }
  return { accessSecret, refreshSecret, accessExpiresIn, refreshExpiresIn };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

function signTokenPair(userId: string, email: string): TokenPair {
  const { accessSecret, refreshSecret, accessExpiresIn, refreshExpiresIn } = getJwtConfig();
  const accessToken = jwt.sign(
    { sub: userId, email },
    accessSecret,
    { expiresIn: accessExpiresIn } as jwt.SignOptions,
  );
  const refreshToken = jwt.sign(
    { sub: userId, email, type: 'refresh' },
    refreshSecret,
    { expiresIn: refreshExpiresIn } as jwt.SignOptions,
  );
  return {
    accessToken,
    refreshToken,
    expiresIn: accessExpiresIn,
  };
}

export async function signUp(input: SignUpInput): Promise<{ user: AuthUser } & TokenPair> {
  const existing = await User.findOne({ where: { email: input.email } });
  if (existing) {
    throw new ApiError({ statusCode: 409, message: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    email: input.email,
    name: input.name ?? null,
    passwordHash,
  });
  const tokens = signTokenPair(user.id, user.email);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    ...tokens,
  };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser } & TokenPair> {
  const user = await User.findOne({ where: { email: input.email } });
  if (!user || !user.passwordHash) {
    throw new ApiError({ statusCode: 401, message: 'Invalid email or password' });
  }
  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) {
    throw new ApiError({ statusCode: 401, message: 'Invalid email or password' });
  }
  const tokens = signTokenPair(user.id, user.email);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    ...tokens,
  };
}

export async function refresh(input: RefreshInput): Promise<TokenPair> {
  const { refreshSecret } = getJwtConfig();
  let payload: { sub?: string; email?: string; type?: string };
  try {
    payload = jwt.verify(input.refreshToken, refreshSecret) as typeof payload;
  } catch {
    throw new ApiError({ statusCode: 401, message: 'Invalid or expired refresh token' });
  }
  if (payload.type !== 'refresh' || !payload.sub || !payload.email) {
    throw new ApiError({ statusCode: 401, message: 'Invalid refresh token' });
  }
  return signTokenPair(payload.sub, payload.email);
}

export function verifyAccessToken(token: string): { id: string; email: string } {
  const { accessSecret } = getJwtConfig();
  let payload: { sub?: string; email?: string };
  try {
    payload = jwt.verify(token, accessSecret) as typeof payload;
  } catch {
    throw new ApiError({ statusCode: 401, message: 'Invalid or expired access token' });
  }
  if (!payload.sub || !payload.email) {
    throw new ApiError({ statusCode: 401, message: 'Invalid token payload' });
  }
  return { id: payload.sub, email: payload.email };
}
