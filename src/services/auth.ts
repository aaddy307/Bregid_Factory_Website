import { mongoService } from './mongodb';
import { useAuthStore, User } from '@/store/authStore';

const AUTH_TOKEN_KEY = 'bregid_token';
const AUTH_USER_KEY = 'bregid_user';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  // Use Web Crypto API for SHA-256 hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.random().toString(36).substring(2, 3)
  ).join('');
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { email, password } = credentials;

  const userDoc = await mongoService.findOne<User>('users', {
    email: email.toLowerCase(),
    isActive: true,
  });

  if (!userDoc) {
    throw new Error('Invalid email or password');
  }

  if (!userDoc.passwordHash) {
    throw new Error('Account not set up properly. Please contact admin.');
  }

  const hash = await hashPassword(password, userDoc.passwordSalt || '');
  if (hash !== userDoc.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken();
  const now = new Date().toISOString();

  // Create session
  await mongoService.deleteOne('sessions', { userId: userDoc._id });
  await mongoService.insertOne('sessions', {
    userId: userDoc._id,
    token,
    isActive: true,
    createdAt: now,
    lastActiveAt: now,
  });

  // Save to localStorage AND cookie (for middleware)
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userDoc));
  setCookie(AUTH_TOKEN_KEY, token);
  setCookie(AUTH_USER_KEY, JSON.stringify(userDoc));

  // Update store
  useAuthStore.getState().setUser(userDoc);
  useAuthStore.getState().setToken(token);
  mongoService.setAccessToken(token);

  return { token, user: userDoc };
}

export async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      await mongoService.deleteOne('sessions', { token });
    }
  } catch {
    // Silently handle logout errors
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  deleteCookie(AUTH_TOKEN_KEY);
  deleteCookie(AUTH_USER_KEY);

  useAuthStore.getState().logout();
  mongoService.clearAccessToken();
}

export function restoreSession(): User | null {
  try {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !userStr) return null;

    const user = JSON.parse(userStr) as User;

    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setToken(token);
    mongoService.setAccessToken(token);

    // Sync cookie for middleware
    setCookie(AUTH_TOKEN_KEY, token);
    setCookie(AUTH_USER_KEY, userStr);

    return user;
  } catch {
    useAuthStore.getState().logout();
    return null;
  }
}

export async function hashAndSetPassword(userId: string, password: string): Promise<boolean> {
  try {
    const salt = Array.from({ length: 32 }, () =>
      Math.random().toString(36).substring(2, 3)
    ).join('');
    const hash = await hashPassword(password, salt);
    await mongoService.updateOne('users', { _id: userId }, {
      $set: { passwordHash: hash, passwordSalt: salt },
    });
    return true;
  } catch {
    return false;
  }
}
