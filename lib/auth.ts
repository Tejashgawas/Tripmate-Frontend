// lib/auth.ts
export const BASE_URL = "https://tripmate-39hm.onrender.com/";

type UserRole = "general" | "provider" | "admin";
type AuthType = "local" | "google";

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  auth_type?: AuthType;
  is_new_user?: boolean;
}

export interface AuthResponse {
  role: UserRole;
  auth_type: AuthType;
  is_new_user: boolean;
  user?: User;
}

/* ───────────────── Core Authentication Functions ───────────────── */

/**
 * Refresh the access token
 * Returns true if successful, false if refresh failed
 */
export async function refreshToken(): Promise<boolean> {
  try {
    console.log('[AUTH] Refreshing token...');
    const res = await fetch(`${BASE_URL}auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    
    if (res.ok) {
      console.log('[AUTH] Token refreshed successfully');
      return true;
    } else {
      console.log('[AUTH] Token refresh failed:', res.status);
      return false;
    }
  } catch (error) {
    console.error('[AUTH] Token refresh error:', error);
    return false;
  }
}

/**
 * Enhanced fetch with automatic retry and token refresh
 * Used internally by the useApi hook
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  config: {
    retries?: number;
    retryDelay?: number;
    factor?: number;
  } = {}
): Promise<Response> => {
  const { retries = 3, retryDelay = 500, factor = 2 } = config;
  let attempt = 0;
  let triedRefresh = false;

  // Ensure the URL is absolute
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url.replace(/^\//, '')}`;

  while (attempt <= retries) {
    try {
      const res = await fetch(fullUrl, {
        ...options,
        credentials: "include",
      });

      // Success case
      if (res.ok) {
        return res;
      }

      // Handle auth errors - try token refresh once per request
      if ((res.status === 401 || res.status === 403) && !triedRefresh) {
        console.log('[AUTH] Auth error, attempting token refresh...');
        triedRefresh = true;
        const refreshed = await refreshToken();
        
        if (refreshed) {
          console.log('[AUTH] Token refreshed, retrying request...');
          continue; // Retry the same request with new token
        } else {
          console.log('[AUTH] Token refresh failed, auth required');
          // Return the 401/403 response to let the caller handle it
          return res;
        }
      }

      // Retry on server errors (5xx)
      if (res.status >= 500 && attempt < retries) {
        console.log(`[AUTH] Server error ${res.status}, retrying... (${attempt + 1}/${retries})`);
        throw new Error(`HTTP ${res.status}`);
      }

      // Return client errors (4xx) without retry
      return res;
    } catch (err) {
      if (attempt >= retries) {
        console.error('[AUTH] Max retries exceeded:', err);
        throw err;
      }
      
      const delay = retryDelay * Math.pow(factor, attempt);
      console.log(`[AUTH] Request failed, retrying in ${delay}ms... (${attempt + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    attempt += 1;
  }
  
  throw new Error("Maximum retries exceeded");
};

/* ───────────────── API Functions ───────────────── */

/**
 * Fetch current user information
 * Used by the authentication context
 */
export async function fetchMe(): Promise<User> {
  console.log('[AUTH] Fetching user info...');
  const res = await fetchWithRetry('me/');
  
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(`Failed to fetch user: ${res.status}`);
  }
  
  const user = await res.json();
  console.log('[AUTH] User fetched successfully:', user);
  return user;
}

/**
 * Choose user role (for new users)
 */
export async function chooseRole(role: Exclude<UserRole, "admin">): Promise<{ message: string; ok: boolean }> {
  console.log('[AUTH] Choosing role:', role);
  const res = await fetchWithRetry('auth/choose-role', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to choose role: ${res.status}`);
  }
  
  const result = await res.json();
  console.log('[AUTH] Role chosen successfully:', result);
  return result;
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  console.log('[AUTH] Logging out user...');
  try {
    await fetchWithRetry('auth/logout', {
      method: "POST",
    });
    console.log('[AUTH] Logout successful');
  } catch (error) {
    // Even if logout fails on server, we still want to clear local auth
    console.log('[AUTH] Logout request failed, but continuing with local logout:', error);
  }
}

/**
 * Login with email and password
 */
export async function loginWithCredentials(email: string, password: string): Promise<User> {
  console.log('[AUTH] Logging in with credentials...');
  const res = await fetch(`${BASE_URL}auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Login failed: ${res.status}`);
  }

  const user = await res.json();
  console.log('[AUTH] Login successful:', user);
  return user;
}

/**
 * Register new user
 */
export async function registerUser(userData: {
  email: string;
  password: string;
  username: string;
}): Promise<User> {
  console.log('[AUTH] Registering new user...');
  const res = await fetch(`${BASE_URL}auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Registration failed: ${res.status}`);
  }

  const user = await res.json();
  console.log('[AUTH] Registration successful:', user);
  return user;
}

/* ───────────────── Utility Functions ───────────────── */

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is provider
 */
export function isProvider(user: User | null): boolean {
  return hasRole(user, 'provider');
}

/**
 * Get redirect path based on user role
 */
export function getDefaultRedirectPath(user: User | null): string {
  if (!user) return '/login';
  
  switch (user.role) {
    case 'admin':
      return '/admin';
    case 'provider':
      return '/provider';
    case 'general':
    default:
      return '/dashboard';
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Storage utilities for client-side data
 */
export const storage = {
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  
  clear: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
};

/* ───────────────── Error Classes ───────────────── */

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

/* ───────────────── Type Guards ───────────────── */

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof Error && error.name === 'AuthError';
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof Error && error.name === 'NetworkError';
}

/* ───────────────── Development Utilities ───────────────── */

/**
 * Debug authentication state (development only)
 */
export function debugAuth(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔐 Auth Debug Info');
    console.log('BASE_URL:', BASE_URL);
    console.log('Current cookies:', document.cookie);
    console.log('LocalStorage auth keys:', 
      Object.keys(localStorage).filter(key => key.toLowerCase().includes('auth'))
    );
    console.groupEnd();
  }
}
