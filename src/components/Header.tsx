
import { useEffect, useState } from "react";
import { Bell, Menu, Settings, User, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useNavigation } from "react-router-dom";
import { CoffeeModal } from "@/components/CoffeeModal";
import { NotificationModal } from "@/components/NotificationModal";
import { MessageSquare, UserPlus, Calendar } from "lucide-react";
import axios from "axios";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notificationCount] = useState(3);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notifications] = useState([
    {
      id: 1,
      type: "message",
      title: "New message from John",
      description: "Hey there! I wanted to discuss the upcoming project with you. Do you have time for a quick call today?",
      time: "2 minutes ago",
      read: false,
      icon: MessageSquare
    },
    {
      id: 2,
      type: "friend",
      title: "Friend request from Sarah",
      description: "Sarah Johnson wants to connect with you on FreeTalk. You have 5 mutual connections.",
      time: "1 hour ago",
      read: false,
      icon: UserPlus
    },
    {
      id: 3,
      type: "session",
      title: "Session reminder",
      description: "Your scheduled language practice session with Maria is starting in 30 minutes. Don't forget to join!",
      time: "3 hours ago",
      read: true,
      icon: Calendar
    }
  ]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        'http://localhost:3000/logout',
        {}, // empty body
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        console.log('Logout successful');
        window.location.href = 'http://localhost:8080/auth';
      }
    } catch (error) {
      console.log('Error occurred', error);
    }
  };

  const handleNotificationClick = () => {
    if (notifications.length > 0) {
      setSelectedNotification(notifications[0]); // Show first notification
      setShowNotificationModal(true);
    }
  };

  const handleMarkAsRead = (id: number) => {
    // Handle marking notification as read
    console.log('Marking notification as read:', id);
  };

  return (
    <>
      <header className="sticky top-2 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 rounded-lg shadow-lg flex-1">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FT</span>
              </div>
              <h1 className="text-xl font-bold hidden sm:block">FreeTalk</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCoffeeModal(true)}
              className="relative"
              title="Buy me a coffee"
            >
              <Coffee className="h-5 w-5" />
            </Button>

            <ThemeToggle />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={()=>{handleLogout()}}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CoffeeModal 
        isOpen={showCoffeeModal} 
        onClose={() => setShowCoffeeModal(false)} 
      />

      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notification={selectedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
}
