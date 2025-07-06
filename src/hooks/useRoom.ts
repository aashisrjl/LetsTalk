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
  const [isConnected, setIsConnected] = useState(socketManager.isConnected());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  console.log('useRoom hook called with:', { roomId, userId, userName, roomTitle });

  const initializeConnection = useCallback(() => {
    if (!roomId || !userId || !userName) {
      console.warn('useRoom: Missing required parameters, skipping initialization');
      setIsLoading(false);
      return;
    }

    console.log('useRoom: Initializing connection for room:', roomId);
    setIsLoading(true);
    
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];

    const socket = socketManager.connect();
    
    const onConnect = () => {
      console.log('useRoom: ✅ Connected to server, socket ID:', socket.id);
      setIsConnected(true);
      retryCountRef.current = 0;
      if (!hasJoinedRef.current) {
        console.log('useRoom: Joining room after connection');
        socketManager.joinRoom(roomId, userId, userName, roomTitle);
        hasJoinedRef.current = true;
      }
    };

    const onDisconnect = () => {
      console.log('useRoom: ❌ Disconnected from server');
      setIsConnected(false);
      hasJoinedRef.current = false;
      toast({
        title: 'Disconnected',
        description: 'Lost connection to the room server. Attempting to reconnect...',
        variant: 'destructive',
      });
    };

    const onConnectError = (error: any) => {
      console.error('useRoom: ❌ Connection error:', error.message, error.stack);
      setIsConnected(false);
      toast({
        title: 'Connection Error',
        description: `Failed to connect to the room server: ${error.message}`,
        variant: 'destructive',
      });
    };

    const onRoomUsers = (data: { users: RoomUser[], ownerId: string }) => {
      console.log('useRoom: 📋 Room users updated:', data);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        setUsers(data.users || []);
        setOwnerId(data.ownerId || '');
        setIsLoading(false);
      }, 200);
    };

    const userJoinedCleanup = socketManager.onUserJoined((data) => {
      console.log('useRoom: 👤 User joined:', data);
      setUsers((prev) => [...prev, data]);
      toast({
        title: 'User Joined',
        description: `${data.userName} joined the room`,
      });
    });

    const userLeftCleanup = socketManager.onUserLeft((data) => {
      console.log('useRoom: 👋 User left:', data);
      setUsers((prev) => prev.filter(u => u.userId !== data.userId));
      toast({
        title: 'User Left',
        description: `${data.userName || 'User'} left the room`,
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
      hasJoinedRef.current = false;
    });

    const errorCleanup = socketManager.onError((data) => {
      console.error('useRoom: ❌ Socket error:', data);
      toast({
        title: 'Error',
        description: data.message || 'An error occurred',
        variant: 'destructive',
      });
      if (data.message === 'Room not found' && retryCountRef.current < maxRetries) {
        console.log(`useRoom: Retrying joinRoom (attempt ${retryCountRef.current + 1})`);
        retryCountRef.current += 1;
        setTimeout(() => {
          socketManager.joinRoom(roomId, userId, userName, roomTitle);
        }, 4000);
      } else if (data.message === 'Room not found') {
        console.log('useRoom: Max retries reached or room not found, redirecting to /rooms');
        navigate('/rooms');
        hasJoinedRef.current = false;
      } else if (data.message === 'Not in a room') {
        console.log('useRoom: Reattempting join due to Not in a room error');
        socketManager.joinRoom(roomId, userId, userName, roomTitle);
      }
    });

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('roomUsers', onRoomUsers);

    cleanupFunctionsRef.current = [
      userJoinedCleanup,
      userLeftCleanup,
      messageCleanup,
      ownershipCleanup,
      kickedCleanup,
      errorCleanup,
      () => socket.off('connect', onConnect),
      () => socket.off('disconnect', onDisconnect),
      () => socket.off('connect_error', onConnectError),
      () => socket.off('roomUsers', onRoomUsers)
    ];

    if (socketManager.isConnected() && !hasJoinedRef.current) {
      console.log('useRoom: Initial socket connection detected, joining room');
      socketManager.joinRoom(roomId, userId, userName, roomTitle);
      hasJoinedRef.current = true;
    }
  }, [roomId, userId, userName, roomTitle, toast, navigate]);

  const sendMessage = useCallback(
    (message: string) => {
      console.log('useRoom: Sending message:', message);
      if (!isConnected) {
        console.warn('useRoom: Cannot send message: not connected');
        toast({
          title: 'Error',
          description: 'Cannot send message: not connected to the server',
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
      console.log('useRoom: Kicking user:', targetUserId);
      if (!isConnected) {
        console.warn('useRoom: Cannot kick user: not connected');
        toast({
          title: 'Error',
          description: 'Cannot kick user: not connected to the server',
          variant: 'destructive',
        });
        return;
      }
      socketManager.kickUser(roomId, targetUserId);
    },
    [roomId, isConnected, toast]
  );

  useEffect(() => {
    initializeConnection();
    return () => {
      console.log('useRoom: Component unmounting, leaving room...');
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      socketManager.leaveRoom(roomId, userId);
      hasJoinedRef.current = false;
    };
  }, [initializeConnection]);

  return {
    users,
    ownerId,
    messages,
    isConnected,
    sendMessage,
    kickUser,
    isOwner: ownerId === userId,
    isLoading,
  };
};