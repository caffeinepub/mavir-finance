// ─── Client-side Authentication Hook ─────────────────────────────────────────

const AUTH_TOKEN_KEY = 'mahveer_auth_token';
const AUTH_USER_KEY = 'mahveer_auth_user';
const USERS_KEY = 'mahveer_users';

export interface AuthUser {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function loadUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function useAuth() {
  function isAuthenticated(): boolean {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  }

  function getCurrentUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function login(email: string, password: string, rememberMe: boolean): { success: boolean; error?: string } {
    const users = loadUsers();
    const passwordHash = simpleHash(password);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);

    if (!user) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }

    const token = `auth_${Date.now()}_${simpleHash(email)}`;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_TOKEN_KEY, token);
    storage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    return { success: true };
  }

  function register(data: RegisterData): { success: boolean; error?: string } {
    const users = loadUsers();
    const exists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());

    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: AuthUser = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: simpleHash(data.password),
    };

    users.push(newUser);
    saveUsers(users);
    return { success: true };
  }

  function logout() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  return { isAuthenticated, getCurrentUser, login, register, logout };
}
