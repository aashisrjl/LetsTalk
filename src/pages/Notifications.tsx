import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { NotificationModal } from "@/components/NotificationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, UserPlus, Calendar, Settings } from "lucide-react";

const Notifications = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "message",
      title: "New message from Maria",
      description: "Thanks for the great Spanish conversation!",
      time: "2 minutes ago",
      read: false,
      icon: MessageSquare
    },
    {
      id: 2,
      type: "friend",
      title: "Friend request",
      description: "John wants to connect with you",
      time: "1 hour ago",
      read: false,
      icon: UserPlus
    },
    {
      id: 3,
      type: "session",
      title: "Session reminder",
      description: "Your French conversation starts in 15 minutes",
      time: "3 hours ago",
      read: true,
      icon: Calendar
    },
    {
      id: 4,
      type: "message",
      title: "Room invitation",
      description: "You've been invited to 'Advanced English Discussion'",
      time: "1 day ago",
      read: true,
      icon: MessageSquare
    },
    {
      id: 5,
      type: "system",
      title: "New feature available",
      description: "Try our new AI-powered pronunciation checker",
      time: "2 days ago",
      read: true,
      icon: Bell
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "message": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "friend": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "session": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "system": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="container mx-auto p-2">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="flex mt-4">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className="flex-1 lg:ml-0">
              <div className="p-4 lg:p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                      <Bell className="h-8 w-8" />
                      Notifications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Stay updated with your language learning community
                    </p>
                  </div>
                  
                  {unreadCount > 0 && (
                    <Button onClick={markAllAsRead} variant="outline">
                      Mark all as read ({unreadCount})
                    </Button>
                  )}
                </div>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Messages</Badge>
                      <Badge variant="secondary">Friend Requests</Badge>
                      <Badge variant="secondary">Session Reminders</Badge>
                      <Badge variant="outline">Room Invitations</Badge>
                      <Badge variant="outline">System Updates</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click to enable/disable notification types
                    </p>
                  </CardContent>
                </Card>

                {/* Notifications List */}
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No notifications</h3>
                        <p className="text-muted-foreground">You're all caught up!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    notifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <Card 
                          key={notification.id} 
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{notification.title}</h4>
                                  {!notification.read && (
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {notification.time}
                                  </span>
                                  <Badge 
                                    variant="secondary" 
                                    className={getTypeColor(notification.type)}
                                  >
                                    {notification.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>

        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          notification={selectedNotification}
          onMarkAsRead={markAsRead}
        />
        
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Notifications;
