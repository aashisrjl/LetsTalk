import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, User, Bell, Settings, X, Users, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Friends", icon: Users, path: "/friends" },
  { name: "Notifications", icon: Bell, path: "/notifications" },
  { name: "Settings", icon: Settings, path: "/settings" },
  { name: "Privacy Policy", icon: FileText, path: "/privacy-policy" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-[4.5rem] left-0 z-50 h-[calc(100vh-4.5rem)] w-64 transform border-r bg-background transition-transform duration-200 ease-in-out lg:sticky lg:top-[4.5rem] lg:translate-x-0 lg:h-[calc(100vh-4.5rem)]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 lg:hidden border-b">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
