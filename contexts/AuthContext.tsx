import { createContext, useContext, useState, ReactNode } from 'react';
import { router } from 'expo-router';

type User = {
  role: 'student' | 'teacher';
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'teacher') => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, role: 'student' | 'teacher') => {
    // Simulate authentication
    const userData = {
      role,
      email,
      name: role === 'teacher' ? 'Prof. Martin' : 'Thomas Durant',
    };
    setUser(userData);
    router.replace(role === 'teacher' ? '/(teacher)' : '/(tabs)');
  };

  const logout = () => {
    setUser(null);
    router.replace('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}