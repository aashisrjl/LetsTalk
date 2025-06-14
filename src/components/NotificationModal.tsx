
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, UserPlus, Calendar, Bell, Reply, Forward, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    id: number;
    type: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    icon: any;
    _id?: string;
  } | null;
  onMarkAsRead: (id: number) => void;
}

export function NotificationModal({ 
  isOpen, 
  onClose, 
  notification, 
  onMarkAsRead 
}: NotificationModalProps) {
  const { deleteNotification } = useNotifications();

  if (!notification) return null;

  const Icon = notification.icon;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "message": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "friend": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "session": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "system": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = async () => {
    if (notification._id) {
      await deleteNotification(notification._id);
      onClose();
    }
  };

  const getActionButtons = () => {
    switch (notification.type) {
      case "message":
        return (
          <div className="flex gap-2">
            <Button size="sm" className="flex items-center gap-2">
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Forward className="h-4 w-4" />
              Forward
            </Button>
          </div>
        );
      case "friend":
        return (
          <div className="flex gap-2">
            <Button size="sm">Accept</Button>
            <Button size="sm" variant="outline">Decline</Button>
          </div>
        );
      case "session":
        return (
          <div className="flex gap-2">
            <Button size="sm">Join Session</Button>
            <Button size="sm" variant="outline">Reschedule</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">{notification.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{notification.time}</span>
                <Badge 
                  variant="secondary" 
                  className={getTypeColor(notification.type)}
                >
                  {notification.type}
                </Badge>
                {!notification.read && (
                  <Badge variant="default" className="text-xs">
                    New
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <DialogDescription className="text-left text-base leading-relaxed py-4">
          {notification.description}
        </DialogDescription>

        <Separator />

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-2">
            {getActionButtons()}
          </div>
          
          <div className="flex gap-2">
            {!notification.read && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleMarkAsRead}
                className="flex items-center gap-2"
              >
                Mark as Read
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDelete}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
