
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { socketManager } from '@/utils/socket';
import axios from 'axios';

interface ChatWindowProps {
  currentUser: any;
  chatPartner: any;
  onBack: () => void;
}

export const ChatWindow = ({ currentUser, chatPartner, onBack }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch chat messages
  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chatMessages', chatPartner?._id],
    queryFn: async () => {
      if (!chatPartner?._id) return [];
      const response = await axios.get(`http://localhost:3000/chat/${chatPartner._id}`, {
        withCredentials: true,
      });
      return response.data.messages;
    },
    enabled: !!chatPartner?._id,
  });

  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages]);

  // Socket connection for real-time chat
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = socketManager.connect();
    if (!socket) return;

    // Join chat room
    socket.emit('joinChat', currentUser._id);

    // Listen for incoming messages
    const handleReceiveMessage = (data: any) => {
      if (data.from === chatPartner?._id) {
        setMessages(prev => [...prev, data.message]);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data: any) => {
      if (data.userId === chatPartner?._id) {
        setIsTyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    socket.on('receivePrivateMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);

    return () => {
      socket.off('receivePrivateMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
    };
  }, [currentUser?._id, chatPartner?._id, queryClient]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser?._id || !chatPartner?._id) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      message: message.trim(),
      sender: { _id: currentUser._id, name: currentUser.name },
      receiver: { _id: chatPartner._id, name: chatPartner.name },
      timestamp: new Date().toISOString(),
      isTemp: true
    };

    // Add message optimistically
    setMessages(prev => [...prev, tempMessage]);
    const messageText = message.trim();
    setMessage('');

    try {
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('sendPrivateMessage', {
          receiverId: chatPartner._id,
          message: messageText,
          senderId: currentUser._id,
          tempId
        });
      } else {
        // Fallback to HTTP if socket not available
        const response = await axios.post(`http://localhost:3000/chat/${chatPartner._id}`, {
          message: messageText
        }, { withCredentials: true });

        // Replace temp message with real message
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? response.data.message : msg
        ));
      }

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error: any) {
      console.error('Send message error:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleTyping = () => {
    const socket = socketManager.getSocket();
    if (socket && chatPartner?._id) {
      socket.emit('typing', {
        receiverId: chatPartner._id,
        isTyping: true
      });
      
      setTimeout(() => {
        socket.emit('typing', {
          receiverId: chatPartner._id,
          isTyping: false
        });
      }, 1000);
    }
  };

  if (!chatPartner) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar>
          <AvatarImage src={chatPartner.photo} />
          <AvatarFallback>
            {chatPartner.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{chatPartner.name}</p>
          {isTyping && <p className="text-sm text-blue-500">typing...</p>}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isOwn = msg.sender?._id === currentUser?._id;
            return (
              <div key={msg._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-900'
                } ${msg.isTemp ? 'opacity-70' : ''}`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
