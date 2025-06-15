
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
          </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
