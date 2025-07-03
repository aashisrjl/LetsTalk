
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
  const isInitialized = useRef(false);
  const hasJoinedRoom = useRef(false);
  const cleanupListeners = useRef<(() => void)[]>([]);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('useRoom hook called with:', { roomId, userId, userName, roomTitle });

  const connectToRoom = useCallback(() => {
    if (isInitialized.current) {
      console.log('useRoom: Already initialized, skipping connection');
      return;
    }

    console.log('useRoom: Connecting to room...');
    isInitialized.current = true;
    const socket = socketManager.connect();

    // Clear any existing timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    connectionTimeoutRef.current = setTimeout(() => {
      if (!socket.connected) {
        console.warn('useRoom: ⏰ Connection timeout');
        toast({
          title: 'Connection Timeout',
          description: 'Failed to connect to the room. Please check your network or try again.',
          variant: 'destructive',
        });
        setIsConnected(false);
        isInitialized.current = false;
        hasJoinedRoom.current = false;
      }
    }, 10000);

    socket.on('connect', () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      console.log('useRoom: ✅ Connected to server, socket ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('useRoom: ❌ Disconnected from server');
      setIsConnected(false);
      isInitialized.current = false;
      hasJoinedRoom.current = false;
      toast({
        title: 'Disconnected',
        description: 'Lost connection to the room server.',
        variant: 'destructive',
      });
    });

    socket.on('connect_error', (error) => {
      console.error('useRoom: ❌ Connection error:', error.message);
      setIsConnected(false);
      isInitialized.current = false;
      hasJoinedRoom.current = false;
      toast({
        title: 'Connection Error',
        description: `Failed to connect to the room server: ${error.message}`,
        variant: 'destructive',
      });
    });

    // Set up event listeners
    cleanupListeners.current.push(socketManager.onRoomUsers((data) => {
      console.log('useRoom: 📋 Room users updated:', data);
      setUsers(data.users || []);
      setOwnerId(data.ownerId || '');
    }));

    cleanupListeners.current.push(socketManager.onUserJoined((data) => {
      console.log('useRoom: 👤 User joined:', data);
      toast({
        title: 'User Joined',
        description: `${data.userName} joined the room`,
      });
    }));

    cleanupListeners.current.push(socketManager.onUserLeft((data) => {
      console.log('useRoom: 👋 User left:', data);
      toast({
        title: 'User Left',
        description: `User left the room`,
      });
    }));

    cleanupListeners.current.push(socketManager.onReceiveMessage((data) => {
      console.log('useRoom: 💬 Message received:', data);
      setMessages((prev) => [...prev, data]);
    }));

    cleanupListeners.current.push(socketManager.onOwnershipTransferred((data) => {
      console.log('useRoom: 👑 Ownership transferred:', data);
      setOwnerId(data.newOwnerId);
      toast({
        title: 'Ownership Transferred',
        description: 'Room ownership has been transferred',
      });
    }));

    cleanupListeners.current.push(socketManager.onKicked((data) => {
      console.log('useRoom: 🚫 Kicked from room:', data);
      toast({
        title: 'Kicked from Room',
        description: data.reason || 'You have been kicked from the room',
        variant: 'destructive',
      });
      navigate('/rooms');
    }));

    cleanupListeners.current.push(socketManager.onError((data) => {
      console.error('useRoom: ❌ Socket error:', data);
      toast({
        title: 'Error',
        description: data.message || 'An error occurred',
        variant: 'destructive',
      });
    }));
  }, [toast, navigate]);

  const joinRoom = useCallback(() => {
    if (!isConnected) {
      console.log('useRoom: Not connected, cannot join room');
      return;
    }
    if (hasJoinedRoom.current) {
      console.log('useRoom: Already joined room, skipping');
      return;
    }
    
    console.log('useRoom: Joining room with data:', { roomId, userId, userName, roomTitle });
    hasJoinedRoom.current = true;
    socketManager.joinRoom(roomId, userId, userName, roomTitle);
  }, [roomId, userId, userName, roomTitle, isConnected]);

  const disconnectFromRoom = useCallback(() => {
    if (!isInitialized.current) {
      console.log('useRoom: Not initialized, skipping disconnect');
      return;
    }
    
    console.log('useRoom: Disconnecting from room...');
    
    // Clear timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    
    // Clean up listeners
    cleanupListeners.current.forEach((cleanup) => cleanup());
    cleanupListeners.current = [];
    
    // Leave room and disconnect
    if (roomId && userId) {
      socketManager.leaveRoom(roomId, userId);
    }
    socketManager.disconnect();
    
    // Reset state
    setIsConnected(false);
    isInitialized.current = false;
    hasJoinedRoom.current = false;
  }, [roomId, userId]);

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

  // Initialize connection only once - remove callback dependencies to prevent re-initialization
  useEffect(() => {
    if (!roomId || !userId || !userName) {
      console.warn('useRoom: Missing required parameters:', { roomId, userId, userName });
      return;
    }

    connectToRoom();
    
    return () => {
      console.log('useRoom: Cleaning up room connection...');
      disconnectFromRoom();
    };
  }, [roomId, userId, userName, roomTitle]); // Only depend on core params, not callbacks

  // Join room when connected - remove callback dependency
  useEffect(() => {
    if (isConnected && roomId && userId && userName && !hasJoinedRoom.current) {
      joinRoom();
    }
  }, [isConnected, roomId, userId, userName, roomTitle]); // Only depend on core params

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
