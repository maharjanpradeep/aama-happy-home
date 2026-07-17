import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email?: string;
  picture?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  login: (idToken: string) => void;
  logout: () => void;
}

const TOKEN_KEY = 'checkinIdToken';

// Matches aama-service-k's AUTH_BYPASS_ENABLED contract (middleware/googleAuth.ts) —
// these tokens skip real Google verification on the backend, dev-only.
export const TEST_PARENT_TOKEN = 'test:parent';
export const TEST_ADMIN_TOKEN = 'test:admin';
export const TEST_VISITOR_TOKEN = 'test:visitor';

const TEST_USERS: Record<string, User> = {
  [TEST_PARENT_TOKEN]: { name: 'Test Parent', email: 'test-parent@local.test' },
  [TEST_ADMIN_TOKEN]: { name: 'Test Admin', email: 'test-admin@local.test' },
  [TEST_VISITOR_TOKEN]: { name: 'Test Visitor', email: 'test-visitor@local.test' },
};

function decodeToken(idToken: string): User | null {
  if (import.meta.env.DEV && idToken in TEST_USERS) return TEST_USERS[idToken];
  try {
    return JSON.parse(atob(idToken.split('.')[1]));
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [idToken, setIdToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const user = idToken ? decodeToken(idToken) : null;

  const login = (token: string) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    setIdToken(token);
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setIdToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, idToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
