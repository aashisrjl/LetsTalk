import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string; // Changed from _id to id to match API
  name: string;
  email?: string; // Made optional to match API
  photo?: string; // Made optional for consistency
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('http://localhost:3000/auth/user', {
          withCredentials: true,
        });
        console.log('GET /auth/user response:', res.data);
        if (res.status === 200 && res.data.success && res.data.user.id && res.data.user.name) {
          setUser({
            id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
            photo: res.data.user.photo,
          });
          setIsAuthenticated(true);
        } else {
          console.error('Invalid user data:', res.data);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('User is not authenticated:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};