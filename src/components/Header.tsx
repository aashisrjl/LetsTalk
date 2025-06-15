import React, { useEffect, useRef, useState } from "react";
import { Bell,
  Menu,
  Settings,
  User,
  Coffee,
  LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { CoffeeModal } from "@/components/CoffeeModal";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { MessageSquare, UserPlus, Calendar } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();

  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Convert backend notifications to frontend format
  const formattedNotifications = notifications.map(notif => ({
    id: parseInt(notif._id.slice(-8), 16), // Convert ObjectId to number for compatibility
    type: notif.type,
    title: notif.title,
    description: notif.description,
    time: new Date(notif.createdAt).toLocaleString(),
    read: notif.read,
    icon: getIconForType(notif.type),
    _id: notif._id // Keep original ID for API calls
  }));

  function getIconForType(type: string) {
    switch (type) {
      case 'message': return MessageSquare;
      case 'friend': return UserPlus;
      case 'session': return Calendar;
      default: return Bell;
    }
  }

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3000/auth/user', {
          withCredentials: true, // Include cookies for authentication
        });
        if (res.status === 200 && res.data.success) {
          setUser(res.data.user); // Set user data
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null); // Clear user if fetch fails (e.g., not logged in)
      }
    };

    fetchUser();
  }, []);

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
        {},
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        console.log('Logout successful');
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const handleMarkAsRead = (id: number) => {
    const notification = formattedNotifications.find(n => n.id === id);
    if (notification) {
      markAsRead(notification._id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
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
                <span className="text-white font-bold text-sm">LT</span>
              </div>
              <h1 className="text-xl font-bold hidden sm:block">LetsTalk</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/buy-me-coffee')}
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
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {showNotificationDropdown && (
                <NotificationDropdown
                  notifications={formattedNotifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              )}
            </div>

            {/* Conditionally render Login button or User Avatar */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photo} alt={user.name} />
                      <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
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
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 bg-blue-400"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
