
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background flex flex-col">
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
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Index;
