
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Users, Crown, UserMinus } from 'lucide-react';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isConnected ? "No other users connected" : "Connecting to room..."}
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
      </CardContent>
    </Card>
  );
};
