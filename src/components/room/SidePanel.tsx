
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatPanel } from './ChatPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { MessageSquare, Users } from 'lucide-react';

interface ChatMessage {
  message: string;
  userName: string;
  time: string;
}

interface User {
  userId: string;
  userName: string;
  photo?: string;
}

interface SidePanelProps {
  // ChatPanel props
  messages: ChatMessage[];
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  
  // ParticipantsPanel props
  users: User[];
  ownerId: string;
  currentUserId: string;
  isOwner: boolean;
  onKickUser: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  
  // Common props
  isConnected: boolean;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  messages,
  messageInput,
  setMessageInput,
  onSendMessage,
  users,
  ownerId,
  currentUserId,
  isOwner,
  onKickUser,
  onViewProfile,
  isConnected,
}) => {
  return (
    <Tabs defaultValue="chat" className="flex flex-col h-full bg-card rounded-lg border">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chat">
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="participants">
          <Users className="w-4 h-4 mr-2" />
          Participants
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="flex-1 min-h-0">
        <ChatPanel
          messages={messages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSendMessage={onSendMessage}
          isConnected={isConnected}
        />
      </TabsContent>
      <TabsContent value="participants" className="flex-1 min-h-0">
        <ParticipantsPanel
          users={users}
          ownerId={ownerId}
          currentUserId={currentUserId}
          isOwner={isOwner}
          isConnected={isConnected}
          onKickUser={onKickUser}
          onViewProfile={onViewProfile}
        />
      </TabsContent>
    </Tabs>
  );
};
