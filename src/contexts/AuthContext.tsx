
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  photo: string;
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
                if (res.status === 200 && res.data.success) {
                    setUser(res.data.user);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.log('User is not authenticated');
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
