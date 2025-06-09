
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Simulate authentication state - in real app this would come from auth context
  const isAuthenticated = true; // Changed back to true to show dashboard content

  return (
    <div className="container">
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
    </div>
  );
};

export default Index;
