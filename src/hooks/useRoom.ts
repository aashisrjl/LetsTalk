
import { useState, useEffect, useCallback } from 'react';
import { socketManager } from '@/utils/socket';
import { useToast } from '@/hooks/use-toast';

interface RoomUser {
  socketId: string;
  userId: string;
  userName: string;
  photo?: string;
  joinTime: Date;
}

interface ChatMessage {
  message: string;
  userName: string;
  time: string;
}

export const useRoom = (roomId: string, userId: string, userName: string, roomTitle: string) => {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [ownerId, setOwnerId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const connectToRoom = useCallback(() => {
    const socket = socketManager.connect();
    
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      socketManager.joinRoom(roomId, userId, userName, roomTitle);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketManager.onRoomUsers((data) => {
      setUsers(data.users || []);
      setOwnerId(data.ownerId || '');
    });

    socketManager.onUserJoined((data) => {
      toast({
        title: "User Joined",
        description: `${data.userName} joined the room`,
      });
    });

    socketManager.onUserLeft((data) => {
      toast({
        title: "User Left",
        description: `User left the room`,
      });
    });

    socketManager.onReceiveMessage((data) => {
      setMessages(prev => [...prev, data]);
    });

    socketManager.onOwnershipTransferred((data) => {
      setOwnerId(data.newOwnerId);
      toast({
        title: "Ownership Transferred",
        description: "Room ownership has been transferred",
      });
    });

    socketManager.onKicked((data) => {
      toast({
        title: "Kicked from Room",
        description: data.reason || "You have been kicked from the room",
        variant: "destructive",
      });
      // Handle redirect or cleanup
    });

    socketManager.onError((data) => {
      toast({
        title: "Error",
        description: data.message || "An error occurred",
        variant: "destructive",
      });
    });

  }, [roomId, userId, userName, roomTitle, toast]);

  const disconnectFromRoom = useCallback(() => {
    if (isConnected) {
      socketManager.leaveRoom(roomId, userId);
      socketManager.removeAllListeners();
      socketManager.disconnect();
      setIsConnected(false);
    }
  }, [roomId, userId, isConnected]);

  const sendMessage = useCallback((message: string) => {
    socketManager.sendMessage(message, userName);
    // Add own message to local state
    setMessages(prev => [...prev, {
      message,
      userName,
      time: new Date().toISOString(),
    }]);
  }, [userName]);

  const kickUser = useCallback((targetUserId: string) => {
    socketManager.kickUser(roomId, targetUserId);
  }, [roomId]);

  useEffect(() => {
    connectToRoom();
    return () => {
      disconnectFromRoom();
    };
  }, [connectToRoom, disconnectFromRoom]);

  return {
    users,
    ownerId,
    messages,
    isConnected,
    sendMessage,
    kickUser,
    isOwner: ownerId === userId,
  };
};
