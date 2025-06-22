
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Crown, UserMinus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { UserProfileModal } from '../userProfileModal';

interface User {
  users: User[];
  userId: string;
  userName: string;
  photo?: string;
    _id: string;
  name: string;
  email?: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  likes?: number;
  followers?: string[];
  friends?: string[];
  likedBy?: string[];
}

interface ParticipantsPanelProps {
  users: User[];
  ownerId: string;
  currentUserId: string;
  isOwner: boolean;
  isConnected: boolean;
  onKickUser: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  users,
  ownerId,
  currentUserId,
  isOwner,
  isConnected,
  onKickUser,
}) => {
  console.log("ParticipantsPanel rendered with users:", users);
  const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

     const handleParticipantClick = async (participantId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/users/${participantId}`, {
        withCredentials: true,
      });
      if (response.data.success && response.data.user) {
        setSelectedUser(response.data.user);
        setIsProfileModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error(`RoomInfoModal: Failed to fetch user profile ${participantId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch user profile",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-full flex flex-col p-4">
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              {isConnected ? "You are the only one here." : "Connecting to room..."}
            </p>
          ) : (
            users.map((user) => (
              <div 
                key={user.userId} 
                className="flex items-center justify-between p-2 rounded-lg border border-transparent cursor-pointer hover:bg-slate-700/50 hover:border-slate-600"
                onClick={() => handleParticipantClick(user.userId)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photo} />
                    <AvatarFallback className="bg-slate-600 text-slate-200">
                      {user.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-slate-200">{user.userName}</p>
                    {user.userId === ownerId && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                
                {user.userId !== currentUserId && isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onKickUser(user.userId)
                    }}
                    className="h-7 w-7 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      {selectedUser && (
              <UserProfileModal
                user={selectedUser}
                currentUserId={selectedUser?._id || ""} 
                isOpen={isProfileModalOpen}
                onClose={() => {
                  setIsProfileModalOpen(false);
                  setSelectedUser(null);
                }}
              />
            )}
    </div>
  );
};
