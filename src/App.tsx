
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import Coffee from './pages/Coffee';
import Friends from './pages/Friends';
import Chat from './pages/Chat';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundaryWrapper from './components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Rooms />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/buy-me-coffee" element={<Coffee />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/room/:roomId" element={
                <ErrorBoundaryWrapper>
                <Room />
              </ErrorBoundaryWrapper>} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:userId" element={<Chat />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
