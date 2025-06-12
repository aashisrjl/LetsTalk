
import { useEffect, useState, useRef } from "react";
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
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { MessageSquare, UserPlus, Calendar } from "lucide-react";
import axios from "axios";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
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
    },
    {
      id: 4,
      type: "message",
      title: "Room invitation",
      description: "You've been invited to 'Advanced English Discussion' room. Join now to start practicing!",
      time: "1 day ago",
      read: true,
      icon: MessageSquare
    },
    {
      id: 5,
      type: "system",
      title: "New feature available",
      description: "Try our new AI-powered pronunciation checker to improve your speaking skills.",
      time: "2 days ago",
      read: true,
      icon: Bell
    }
  ]);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const notificationCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
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
            
            <div className="relative" ref={notificationRef}>
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

              {showNotificationDropdown && (
                <NotificationDropdown
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              )}
            </div>

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
    </>
  );
}
