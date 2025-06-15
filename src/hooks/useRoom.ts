import { useState, useEffect, useCallback } from 'react';
import { socketManager } from '@/utils/socket';
import { useToast } from '@/hooks/use-toast';

interface RoomUser {
  _id: string; // Use _id from MongoDB
  socketId: string;
  userId: string;
  userName: string;
  photo?: string;
  joinTime: Date;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
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

  console.log('useRoom hook called with:', { roomId, userId, userName, roomTitle });

  const connectToRoom = useCallback(() => {
    console.log('Attempting to connect to room...');
    const socket = socketManager.connect();
    
    // By removing all listeners before adding new ones, we prevent duplicate listeners
    // that can happen during component re-renders, ensuring user updates are handled correctly.
    socketManager.removeAllListeners();

    const connectionTimeout = setTimeout(() => {
      if (!socket.connected) {
        console.warn('⏰ Connection timeout');
        toast({
          title: "Connection Timeout",
          description: "Taking longer than expected to connect. Please check your internet connection.",
          variant: "destructive",
        });
      }
    }, 10000);
    
    socket.on('connect', () => {
      clearTimeout(connectionTimeout);
      console.log('✅ Connected to server, socket ID:', socket.id);
      setIsConnected(true);
      console.log('Joining room with data:', { roomId, userId, userName, roomTitle });
      socketManager.joinRoom(roomId, userId, userName, roomTitle);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the room server",
        variant: "destructive",
      });
    });

    socketManager.onRoomUsers((data) => {
      console.log('📋 Room users updated:', data);
      setUsers(data.users || []);
      setOwnerId(data.ownerId || '');
    });

    socketManager.onUserJoined((data) => {
      console.log('👤 User joined:', data);
      toast({
        title: "User Joined",
        description: `${data.userName} joined the room`,
      });
    });

    socketManager.onUserLeft((data) => {
      console.log('👋 User left:', data);
      toast({
        title: "User Left",
        description: `User left the room`,
      });
    });

    socketManager.onReceiveMessage((data) => {
      console.log('💬 Message received:', data);
      setMessages(prev => [...prev, data]);
    });

    socketManager.onOwnershipTransferred((data) => {
      console.log('👑 Ownership transferred:', data);
      setOwnerId(data.newOwnerId);
      toast({
        title: "Ownership Transferred",
        description: "Room ownership has been transferred",
      });
    });

    socketManager.onKicked((data) => {
      console.log('🚫 Kicked from room:', data);
      toast({
        title: "Kicked from Room",
        description: data.reason || "You have been kicked from the room",
        variant: "destructive",
      });
    });

    socketManager.onError((data) => {
      console.error('❌ Socket error:', data);
      toast({
        title: "Error",
        description: data.message || "An error occurred",
        variant: "destructive",
      });
    });

  }, [roomId, userId, userName, roomTitle, toast]);

  const disconnectFromRoom = useCallback(() => {
    console.log('Disconnecting from room...');
    socketManager.leaveRoom(roomId, userId);
    socketManager.removeAllListeners();
    socketManager.disconnect();
    setIsConnected(false);
  }, [roomId, userId]);

  const sendMessage = useCallback((message: string) => {
    console.log('Sending message:', message);
    if (!isConnected) {
      console.warn('Cannot send message: not connected');
      toast({
        title: "Cannot Send Message",
        description: "Not connected to the room",
        variant: "destructive",
      });
      return;
    }
    
    socketManager.sendMessage(message, userName);
    // Add own message to local state
    const newMessage = {
      message,
      userName,
      time: new Date().toISOString(),
    };
    console.log('Adding local message:', newMessage);
    setMessages(prev => [...prev, newMessage]);
  }, [userName, isConnected, toast]);

  const kickUser = useCallback((targetUserId: string) => {
    console.log('Kicking user:', targetUserId);
    socketManager.kickUser(roomId, targetUserId);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !userId || !userName) {
      console.warn('Missing required parameters for room connection');
      return;
    }
    
    console.log('Setting up room connection...');
    connectToRoom();
    
    return () => {
      console.log('Cleaning up room connection...');
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
