
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface RoomData {
  language: string;
  level: string;
  participants: any[];
  maxParticipants: number;
}

interface RoomHeaderProps {
  roomTitle: string;
  roomId: string;
  roomData: RoomData | null;
  isConnected: boolean;
  onLeaveRoom: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomTitle,
  roomId,
  roomData,
  isConnected,
  onLeaveRoom,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{roomTitle}</h1>
        <p className="text-muted-foreground">Room ID: {roomId}</p>
        {roomData && (
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{roomData.language}</Badge>
            <Badge variant="outline">{roomData.level}</Badge>
            <Badge variant="outline">{roomData.participants?.length || 0}/{roomData.maxParticipants} participants</Badge>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
        <Button variant="outline" onClick={onLeaveRoom}>
          <LogOut className="w-4 h-4 mr-2" />
          Leave Room
        </Button>
      </div>
    </div>
  );
};
