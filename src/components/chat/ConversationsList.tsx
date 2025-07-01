
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare } from 'lucide-react';
import axios from 'axios';

interface ConversationsListProps {
  onUserSelect: (user: any) => void;
}

export const ConversationsList = ({ onUserSelect }: ConversationsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/chat/conversations', {
        withCredentials: true,
      });
      return response.data.conversations;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch friends for new conversations
  const { data: friendsData = [] } = useQuery({
    queryKey: ['friendsForChat'],
    queryFn: async () => {
      const userResponse = await axios.get('http://localhost:3000/auth/user-data', {
        withCredentials: true,
      });
      const friends = userResponse.data.user.friends || [];
      
      if (friends.length === 0) return [];
      
      const friendPromises = friends.map((friendId: string) =>
        axios.get(`http://localhost:3000/users/${friendId}`, {
          withCredentials: true,
        })
      );
      
      const responses = await Promise.all(friendPromises);
      return responses.map(response => response.data.user);
    },
  });

  const filteredConversations = conversations.filter((conv: any) =>
    conv._id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFriends = friendsData.filter((friend: any) =>
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !conversations.some((conv: any) => conv._id?._id === friend._id)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Recent Conversations */}
          {filteredConversations.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Recent</h3>
              {filteredConversations.map((conversation: any) => (
                <div
                  key={conversation._id?._id}
                  onClick={() => onUserSelect(conversation._id)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={conversation._id?.photo} />
                    <AvatarFallback>
                      {conversation._id?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation._id?.name}</p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends List */}
          {filteredFriends.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Friends</h3>
              {filteredFriends.map((friend: any) => (
                <div
                  key={friend._id}
                  onClick={() => onUserSelect(friend)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={friend.photo} />
                    <AvatarFallback>
                      {friend.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-sm text-gray-500">Start a conversation</p>
                  </div>
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}

          {filteredConversations.length === 0 && filteredFriends.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
