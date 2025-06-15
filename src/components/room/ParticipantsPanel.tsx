
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Crown, UserMinus } from 'lucide-react';

interface User {
  userId: string;
  userName: string;
  photo?: string;
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
  onViewProfile,
}) => {
  console.log("ParticipantsPanel rendered with users:", users);
  return (
    <div className="h-full flex flex-col p-4">
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isConnected ? "You are the only one here." : "Connecting to room..."}
            </p>
          ) : (
            users.map((user) => (
              <div 
                key={user.userId} 
                className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-muted"
                onClick={() => onViewProfile(user.userId)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photo} />
                    <AvatarFallback>
                      {user.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium">{user.userName}</p>
                    {user.userId === ownerId && (
                      <Crown className="w-3 h-3 text-yellow-500" />
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
                    className="h-6 w-6"
                  >
                    <UserMinus className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
