
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

// Singleton connection manager to prevent multiple instances
let globalRoomConnection: {
  socket: any;
  roomId: string | null;
  users: RoomUser[];
  ownerId: string;
  messages: ChatMessage[];
  isConnected: boolean;
  listeners: (() => void)[];
} | null = null;

export const useRoom = (roomId: string, userId: string, userName: string, roomTitle: string) => {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [ownerId, setOwnerId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('useRoom hook called with:', { roomId, userId, userName, roomTitle });

  const initializeConnection = useCallback(() => {
    if (globalRoomConnection && globalRoomConnection.roomId === roomId) {
      console.log('useRoom: Using existing connection');
      setUsers(globalRoomConnection.users);
      setOwnerId(globalRoomConnection.ownerId);
      setMessages(globalRoomConnection.messages);
      setIsConnected(globalRoomConnection.isConnected);
      return;
    }

    console.log('useRoom: Creating new connection');
    
    // Clean up existing connection if different room
    if (globalRoomConnection) {
      console.log('useRoom: Cleaning up previous connection');
      globalRoomConnection.listeners.forEach(cleanup => cleanup());
      if (globalRoomConnection.socket) {
        socketManager.disconnect();
      }
    }

    const socket = socketManager.connect();
    
    globalRoomConnection = {
      socket,
      roomId,
      users: [],
      ownerId: '',
      messages: [],
      isConnected: false,
      listeners: []
    };

    // Connection events
    socket.on('connect', () => {
      console.log('useRoom: ✅ Connected to server, socket ID:', socket.id);
      if (globalRoomConnection) {
        globalRoomConnection.isConnected = true;
        setIsConnected(true);
        
        // Auto-join room on connection
        setTimeout(() => {
          console.log('useRoom: Auto-joining room after connection');
          socketManager.joinRoom(roomId, userId, userName, roomTitle);
        }, 100);
      }
    });

    socket.on('disconnect', () => {
      console.log('useRoom: ❌ Disconnected from server');
      if (globalRoomConnection) {
        globalRoomConnection.isConnected = false;
        setIsConnected(false);
      }
      toast({
        title: 'Disconnected',
        description: 'Lost connection to the room server.',
        variant: 'destructive',
      });
    });

    socket.on('connect_error', (error) => {
      console.error('useRoom: ❌ Connection error:', error.message);
      if (globalRoomConnection) {
        globalRoomConnection.isConnected = false;
        setIsConnected(false);
      }
      toast({
        title: 'Connection Error',
        description: `Failed to connect to the room server: ${error.message}`,
        variant: 'destructive',
      });
    });

    // Room events
    const roomUsersCleanup = socketManager.onRoomUsers((data) => {
      console.log('useRoom: 📋 Room users updated:', data);
      if (globalRoomConnection) {
        globalRoomConnection.users = data.users || [];
        globalRoomConnection.ownerId = data.ownerId || '';
      }
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
      if (globalRoomConnection) {
        globalRoomConnection.messages.push(data);
      }
      setMessages((prev) => [...prev, data]);
    });

    const ownershipCleanup = socketManager.onOwnershipTransferred((data) => {
      console.log('useRoom: 👑 Ownership transferred:', data);
      if (globalRoomConnection) {
        globalRoomConnection.ownerId = data.newOwnerId;
      }
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

    // Store cleanup functions
    globalRoomConnection.listeners = [
      roomUsersCleanup,
      userJoinedCleanup,
      userLeftCleanup,
      messageCleanup,
      ownershipCleanup,
      kickedCleanup,
      errorCleanup
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
      if (globalRoomConnection && globalRoomConnection.roomId === roomId) {
        socketManager.leaveRoom(roomId, userId);
      }
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
