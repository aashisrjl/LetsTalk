
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Send, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import axios from 'axios';

const Chat = () => {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch current user's data
  const { data: userData } = useQuery({
    queryKey: ['currentUserSocial'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/auth/user-data', {
        withCredentials: true,
      });
      return response.data.user;
    },
  });

  // Fetch detailed friend data
  const { data: friendsData } = useQuery({
    queryKey: ['friendsDetails', userData?.friends],
    queryFn: async () => {
      if (!userData?.friends?.length) return [];
      
      const friendPromises = userData.friends.map((friendId: string) =>
        axios.get(`http://localhost:3000/users/${friendId}`, {
          withCredentials: true,
        })
      );
      
      const responses = await Promise.all(friendPromises);
      return responses.map(response => response.data.user);
    },
    enabled: !!userData?.friends?.length,
  });

  // Use chat hook for real-time messaging
  const { messages, sendMessage, isConnected } = useChat(
    userData?.id, 
    selectedFriend?.id
  );

  const filteredFriends = friendsData?.filter((friend: any) =>
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSendMessage = () => {
    if (!message.trim() || !selectedFriend) return;
    
    sendMessage(message);
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="h-[calc(100vh-12rem)] flex gap-6">
            {/* Friends List */}
            <Card className="w-1/3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Friends {!isConnected && <span className="text-red-500 text-sm">(Offline)</span>}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search friends..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {filteredFriends.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {filteredFriends.map((friend: any) => (
                        <div
                          key={friend.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedFriend?.id === friend.id
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedFriend(friend)}
                        >
                          <Avatar>
                            <AvatarImage src={friend.photo} />
                            <AvatarFallback>
                              {friend.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {friend.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No friends found</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1">
              {selectedFriend ? (
                <>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedFriend.photo} />
                        <AvatarFallback>
                          {selectedFriend.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedFriend.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedFriend.location}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full p-0">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.fromUserId === userData?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`rounded-lg px-4 py-2 max-w-xs ${
                                msg.fromUserId === userData?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p>{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {messages.length === 0 && (
                          <div className="text-center text-muted-foreground py-8">
                            No messages yet. Start the conversation!
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                          disabled={!isConnected}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          size="icon"
                          disabled={!isConnected || !message.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      {!isConnected && (
                        <p className="text-sm text-red-500 mt-2">
                          Disconnected - trying to reconnect...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a friend to start chatting
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Chat;
