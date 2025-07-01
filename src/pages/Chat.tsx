
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch current user data
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/auth/user-data', {
        withCredentials: true,
      });
      return response.data.user;
    },
  });

  // Fetch selected user data if userId is provided
  const { data: chatPartner } = useQuery({
    queryKey: ['chatPartner', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await axios.get(`http://localhost:3000/users/${userId}`, {
        withCredentials: true,
      });
      return response.data.user;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (chatPartner) {
      setSelectedUser(chatPartner);
    }
  }, [chatPartner]);

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    navigate(`/chat/${user._id}`);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex">
          <div className="w-full max-w-6xl mx-auto flex h-[calc(100vh-4.5rem)]">
            {/* Conversations List */}
            <div className={`${selectedUser ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r`}>
              <ConversationsList onUserSelect={handleUserSelect} />
            </div>
            
            {/* Chat Window */}
            <div className={`${selectedUser ? 'block' : 'hidden md:block'} w-full md:w-2/3`}>
              {selectedUser ? (
                <ChatWindow
                  currentUser={currentUser}
                  chatPartner={selectedUser}
                  onBack={handleBackToList}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">Select a conversation to start chatting</p>
                    <p className="text-sm">Choose from your friends or recent conversations</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Chat;
