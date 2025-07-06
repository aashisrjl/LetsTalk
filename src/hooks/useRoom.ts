
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  console.log('useRoom hook called with:', { roomId, userId, userName, roomTitle });

  const initializeConnection = useCallback(() => {
    console.log('useRoom: Creating connection for room:', roomId);
    
    // Clean up any existing listeners
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];

    const socket = socketManager.connect();
    
    // Connection events
    const onConnect = () => {
      console.log('useRoom: ✅ Connected to server, socket ID:', socket.id);
      setIsConnected(true);
      
      // Join room after connection
      setTimeout(() => {
        console.log('useRoom: Joining room after connection');
        socketManager.joinRoom(roomId, userId, userName, roomTitle);
      }, 100);
    };

    const onDisconnect = () => {
      console.log('useRoom: ❌ Disconnected from server');
      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Lost connection to the room server.',
        variant: 'destructive',
      });
    };

    const onConnectError = (error: any) => {
      console.error('useRoom: ❌ Connection error:', error.message);
      setIsConnected(false);
      toast({
        title: 'Connection Error',
        description: `Failed to connect to the room server: ${error.message}`,
        variant: 'destructive',
      });
    };

    // Room events  
    const roomUsersCleanup = socketManager.onRoomUsers((data) => {
      console.log('useRoom: 📋 Room users updated:', data);
      setUsers(data.users || []);
      setOwnerId(data.ownerId || '');
    });

    const userJoinedCleanup = socketManager.onUserJoined((data) => {
      console.log('useRoom: 👤 User joined:', data);
      toast({
        title: 'User Joined',
        description: `${data.userName} joined the room`,
      });
    });

    const userLeftCleanup = socketManager.onUserLeft((data) => {
      console.log('useRoom: 👋 User left:', data);
      toast({
        title: 'User Left',
        description: `User left the room`,
      });
    });

    const messageCleanup = socketManager.onReceiveMessage((data) => {
      console.log('useRoom: 💬 Message received:', data);
      setMessages((prev) => [...prev, data]);
    });

    const ownershipCleanup = socketManager.onOwnershipTransferred((data) => {
      console.log('useRoom: 👑 Ownership transferred:', data);
      setOwnerId(data.newOwnerId);
      toast({
        title: 'Ownership Transferred',
        description: 'Room ownership has been transferred',
      });
    });

    const kickedCleanup = socketManager.onKicked((data) => {
      console.log('useRoom: 🚫 Kicked from room:', data);
      toast({
        title: 'Kicked from Room',
        description: data.reason || 'You have been kicked from the room',
        variant: 'destructive',
      });
      navigate('/rooms');
    });

    const errorCleanup = socketManager.onError((data) => {
      console.error('useRoom: ❌ Socket error:', data);
      toast({
        title: 'Error',
        description: data.message || 'An error occurred',
        variant: 'destructive',
      });
    });

    // Setup socket event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Store cleanup functions
    cleanupFunctionsRef.current = [
      roomUsersCleanup,
      userJoinedCleanup,
      userLeftCleanup,
      messageCleanup,
      ownershipCleanup,
      kickedCleanup,
      errorCleanup,
      () => socket.off('connect', onConnect),
      () => socket.off('disconnect', onDisconnect),
      () => socket.off('connect_error', onConnectError)
    ];

  }, [roomId, userId, userName, roomTitle, toast, navigate]);

  const sendMessage = useCallback(
    (message: string) => {
      console.log('useRoom: Sending message:', message);
      if (!isConnected) {
        console.warn('useRoom: Cannot send message: not connected');
        return;
      }
      socketManager.sendMessage(message, userName);
    },
    [userName, isConnected]
  );

  const kickUser = useCallback(
    (targetUserId: string) => {
      console.log('useRoom: Kicking user:', targetUserId);
      socketManager.kickUser(roomId, targetUserId);
    },
    [roomId]
  );

  // Initialize once on mount
  useEffect(() => {
    if (!roomId || !userId || !userName) {
      console.warn('useRoom: Missing required parameters:', { roomId, userId, userName });
      return;
    }

    initializeConnection();
  }, [initializeConnection]);

  // Cleanup on unmount or room change
  useEffect(() => {
    return () => {
      console.log('useRoom: Component unmounting, leaving room...');
      // Clean up listeners
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      // Leave room
      socketManager.leaveRoom(roomId, userId);
    };
  }, [roomId, userId]);

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
