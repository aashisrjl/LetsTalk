// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Functional component wrapper for error boundary
const ErrorBoundaryWrapper = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('ErrorBoundary caught error:', error, errorInfo);
      toast({
        title: 'Application Error',
        description: 'An unexpected error occurred. Redirecting to rooms...',
        variant: 'destructive',
      });
      setTimeout(() => navigate('/rooms'), 2000);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="flex items-center justify-center h-screen text-slate-100">
            An error occurred. Redirecting...
          </div>
        );
      }
      return this.props.children;
    }
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWrapper;