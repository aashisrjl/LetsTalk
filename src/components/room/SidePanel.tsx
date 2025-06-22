
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatPanel } from './ChatPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { MessageSquare, Users, Settings } from 'lucide-react';

interface ChatMessage {
  message: string;
  userName: string;
  time: string;
}

interface User {
  userId: string;
  userName: string;
  photo?: string;
  _id: string;
}

interface RoomData {
  language: string;
  level: string;
  participants: any[];
  maxParticipants: number;
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
  // onViewProfile: (userId: string) => void;
  
  // Common props
  isConnected: boolean;
  roomData: RoomData | null;
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
  // onViewProfile,
  isConnected,
  roomData,
}) => {
  return (
    <Tabs defaultValue="chat" className="flex flex-col h-full bg-slate-800 text-slate-200">
      <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 rounded-none p-1">
        <TabsTrigger value="chat" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          <MessageSquare className="w-5 h-5" />
        </TabsTrigger>
        <TabsTrigger value="participants" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          <Users className="w-5 h-5" />
        </TabsTrigger>
        <TabsTrigger value="info" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          <Settings className="w-5 h-5" />
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
          // onViewProfile={onViewProfile}
        />
      </TabsContent>
      <TabsContent value="info" className="flex-1 min-h-0 p-4 space-y-4">
        <h3 className="font-semibold text-white">Room Info</h3>
        {roomData ? (
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium text-slate-400">Language</p>
              <p className="text-slate-200">{roomData.language}</p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Level</p>
              <p className="text-slate-200">{roomData.level}</p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Participants</p>
              <p className="text-slate-200">{roomData.participants?.length || 0} / {roomData.maxParticipants}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Loading room details...</p>
        )}
      </TabsContent>
    </Tabs>
  );
};
