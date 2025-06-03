
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, User, Bell, Settings, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Home", icon: Home, current: true },
  { name: "Rooms", icon: MessageSquare, current: false },
  { name: "Profile", icon: User, current: false },
  { name: "Notifications", icon: Bell, current: false },
  { name: "Settings", icon: Settings, current: false },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
        "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 lg:hidden">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={item.current ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    // Handle navigation
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
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
