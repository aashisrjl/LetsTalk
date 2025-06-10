
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Facebook, Mail } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState<'google' | 'facebook' | null>(null);

  const handleGoogleAuth = async () => {
    setIsLoading('google');
    try {
      // Redirect to Google OAuth
      window.location.href = `http://localhost:3000/auth/google`;
    } catch (error) {
      console.error('Google authentication error:', error);
      setIsLoading(null);
    }
  };

  const handleFacebookAuth = async () => {
    setIsLoading('facebook');
    try {
      // Redirect to Facebook OAuth
      window.location.href = `http://localhost:3000/auth/facebook`;
    } catch (error) {
      console.error('Facebook authentication error:', error);
      setIsLoading(null);
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="container min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
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
                Sign in to continue
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Choose your preferred sign-in method
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Sign In */}
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium"
                onClick={handleGoogleAuth}
                disabled={isLoading !== null}
              >
                {isLoading === 'google' ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                <span className="ml-3">Continue with Google</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Facebook Sign In */}
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-950"
                onClick={handleFacebookAuth}
                disabled={isLoading !== null}
              >
                {isLoading === 'facebook' ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Facebook className="h-5 w-5 text-blue-600" />
                )}
                <span className="ml-3 text-blue-600 dark:text-blue-400">Continue with Facebook</span>
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 px-4">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Auth;
