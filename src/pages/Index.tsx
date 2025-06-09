
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Simulate authentication state - in real app this would come from auth context
  const isAuthenticated = false;

  const handleAuthNavigation = () => {
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl sm:text-2xl">FT</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to FreeTalk
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                Connect with language learners worldwide
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl sm:text-2xl text-center">
                Get Started
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Join our community of language learners
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                size="lg"
                className="w-full h-12 text-base font-medium"
                onClick={handleAuthNavigation}
              >
                <LogIn className="h-5 w-5 mr-3" />
                Sign In / Sign Up
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  New to FreeTalk?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={handleAuthNavigation}
                  >
                    Create your account
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ✨ Practice with native speakers
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              🌍 Join language exchange rooms
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📱 Chat and video calls
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-2">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex mt-4">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className="flex-1 lg:ml-0">
            <div className="p-4">
              <Dashboard />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
