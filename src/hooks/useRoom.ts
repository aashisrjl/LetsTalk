import { useState, useEffect, useCallback } from 'react';
import { socketManager } from '@/utils/socket';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface RoomUser {
  _id: string;
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
  const navigate = useNavigate();

  console.log('useRoom hook called with:', { roomId, userId, userName, roomTitle });

  const connectToRoom = useCallback(() => {
    console.log('Attempting to connect to room...');
    const socket = socketManager.connect();

    const connectionTimeout = setTimeout(() => {
      if (!socket.connected) {
        console.warn('⏰ Connection timeout');
        toast({
          title: 'Connection Timeout',
          description: 'Failed to connect to the room. Please check your network or try again.',
          variant: 'destructive',
        });
        setIsConnected(false);
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
      toast({
        title: 'Disconnected',
        description: 'Lost connection to the room server.',
        variant: 'destructive',
      });
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setIsConnected(false);
      toast({
        title: 'Connection Error',
        description: `Failed to connect to the room server: ${error.message}`,
        variant: 'destructive',
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
        title: 'User Joined',
        description: `${data.userName} joined the room`,
      });
    });

    socketManager.onUserLeft((data) => {
      console.log('👋 User left:', data);
      toast({
        title: 'User Left',
        description: `User left the room`,
      });
    });

    socketManager.onReceiveMessage((data) => {
      console.log('💬 Message received:', data);
      setMessages((prev) => [...prev, data]);
    });

    socketManager.onOwnershipTransferred((data) => {
      console.log('👑 Ownership transferred:', data);
      setOwnerId(data.newOwnerId);
      toast({
        title: 'Ownership Transferred',
        description: 'Room ownership has been transferred',
      });
    });

    socketManager.onKicked((data) => {
      console.log('🚫 Kicked from room:', data);
      toast({
        title: 'Kicked from Room',
        description: data.reason || 'You have been kicked from the room',
        variant: 'destructive',
      });
      navigate('/rooms');
    });

    socketManager.onError((data) => {
      console.error('❌ Socket error:', data);
      toast({
        title: 'Error',
        description: data.message || 'An error occurred',
        variant: 'destructive',
      });
    });
  }, [roomId, userId, userName, roomTitle, toast, navigate]);

  const disconnectFromRoom = useCallback(() => {
    console.log('Disconnecting from room...');
    socketManager.leaveRoom(roomId, userId);
    socketManager.disconnect();
    setIsConnected(false);
  }, [roomId, userId]);

  const sendMessage = useCallback(
    (message: string) => {
      console.log('Sending message:', message);
      if (!isConnected) {
        console.warn('Cannot send message: not connected');
        toast({
          title: 'Cannot Send Message',
          description: 'Not connected to the room',
          variant: 'destructive',
        });
        return;
      }
      socketManager.sendMessage(message, userName);
    },
    [userName, isConnected, toast]
  );

  const kickUser = useCallback(
    (targetUserId: string) => {
      console.log('Kicking user:', targetUserId);
      socketManager.kickUser(roomId, targetUserId);
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId || !userId || !userName) {
      console.warn('Missing required parameters for room connection:', { roomId, userId, userName });
      toast({
        title: 'Invalid Parameters',
        description: 'Room ID, user ID, or username is missing',
        variant: 'destructive',
      });
      navigate('/rooms');
      return;
    }

    console.log('Setting up room connection...');
    connectToRoom();

    return () => {
      console.log('Cleaning up room connection...');
      disconnectFromRoom();
    };
  }, [connectToRoom, disconnectFromRoom, roomId, userId, userName, toast, navigate]);

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