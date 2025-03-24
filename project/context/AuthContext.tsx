import React, { createContext, useContext, useState, useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type User = {
  id: string;
  username: string;
  role: 'student' | 'professor';
};

type AuthContextType = {
  user: User | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Test accounts data
const TEST_ACCOUNTS = {
  et1: { password: 'mdpe1', role: 'student' },
  et2: { password: 'mdpe2', role: 'student' },
  prof1: { password: 'mdpp1', role: 'professor' },
  prof2: { password: 'mdpp2', role: 'professor' },
};

// Storage helper functions
const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const segments = useSegments();

  useEffect(() => {
    // Check for stored user data on mount
    const loadUser = async () => {
      try {
        const storedUser = await storage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // If there's no user and we're not in the auth group, redirect to login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // If we have a user and we're still in the auth group, redirect to main app
      router.replace('/(app)/(tabs)/schedule');
    }
  }, [user, segments]);

  const signIn = async (username: string, password: string) => {
    const account = TEST_ACCOUNTS[username as keyof typeof TEST_ACCOUNTS];
    
    if (!account || account.password !== password) {
      throw new Error('Invalid credentials');
    }

    const userData: User = {
      id: username,
      username,
      role: account.role,
    };

    await storage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.replace('/(app)/(tabs)/schedule');
  };

  const signOut = async () => {
    await storage.removeItem('user');
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};