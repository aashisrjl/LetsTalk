import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';
import { VideoGrid } from '@/components/VideoGrid';
import { MediaControls } from './MediaControls';

interface User {
  userId: string;
  userName: string;
  photo?: string;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
}

interface VideoConferenceProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  users: User[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  localUserId: string;
  isScreenSharing: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startScreenShare: () => void;
  isConnected: boolean;
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  localStream,
  remoteStreams,
  users,
  isVideoEnabled,
  isAudioEnabled,
  localUserId,
  isScreenSharing,
  toggleAudio,
  toggleVideo,
  startScreenShare,
  isConnected,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video Conference
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col justify-between">
        <div className="flex-1 min-h-0">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            users={users}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            localUserId={localUserId}
          />
        </div>
        
        <div className="mt-4">
          <MediaControls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
            localStream={localStream}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onScreenShare={startScreenShare}
          />
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Connection: {isConnected ? "Connected" : "Connecting..."}
          </p>
          <p className="text-sm text-muted-foreground">
            Users in room: {users.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
