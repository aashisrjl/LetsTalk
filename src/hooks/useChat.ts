
import { useState, useEffect, useRef } from 'react';
import { socketManager } from '@/utils/socket';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

export const useChat = (currentUserId: string, friendId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Connect socket
    socketRef.current = socketManager.connect();
    const socket = socketRef.current;

    if (socket && currentUserId) {
      // Emit user online status
      socket.emit('userOnline', { userId: currentUserId });
      
      setIsConnected(true);

      // Listen for chat history from database
      socket.on('chatHistory', ({ messages: chatHistory }) => {
        setMessages(chatHistory);
      });

      // Listen for incoming messages
      socket.on('receivePrivateMessage', (messageData: Message) => {
        setMessages(prev => [...prev, messageData]);
      });

      // Handle connection status
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
    }

    return () => {
      if (socket) {
        socket.off('chatHistory');
        socket.off('receivePrivateMessage');
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [currentUserId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket && currentUserId && friendId) {
      // Clear previous messages when switching friends
      setMessages([]);
      
      // Join private chat room
      socket.emit('joinPrivateChat', { userId: currentUserId, friendId });
      
      return () => {
        // Leave chat room when friend changes
        const chatRoomId = [currentUserId, friendId].sort().join('-');
        socket.emit('leavePrivateChat', { chatRoomId });
      };
    }
  }, [currentUserId, friendId]);

  const sendMessage = (messageText: string) => {
    const socket = socketRef.current;
    if (socket && currentUserId && friendId && messageText.trim()) {
      socket.emit('sendPrivateMessage', {
        fromUserId: currentUserId,
        toUserId: friendId,
        message: messageText.trim(),
      });
    }
  };

  const markMessagesAsRead = () => {
    const socket = socketRef.current;
    if (socket && currentUserId && friendId) {
      const chatRoomId = [currentUserId, friendId].sort().join('-');
      socket.emit('markMessagesRead', { chatRoomId, userId: currentUserId });
    }
  };

  return {
    messages,
    sendMessage,
    markMessagesAsRead,
    isConnected,
  };
};
