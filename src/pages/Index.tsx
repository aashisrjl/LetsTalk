
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 p-4 lg:p-6">
            <Dashboard />
          </main>
        </div>

        {/* Floating Create Room Button */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <CreateRoomModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      </div>
    </ThemeProvider>
  );
};

export default Index;
