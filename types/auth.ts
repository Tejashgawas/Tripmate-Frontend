export interface User {
  id: number;
  email: string;
  username: string;
  role: 'general' | 'provider' | 'admin';
  auth_type: 'google' | 'local';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<string>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
