
import React from 'react';
import { Video } from 'lucide-react';
import { VideoGrid } from '@/components/VideoGrid';

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
  isConnected: boolean;
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  localStream,
  remoteStreams,
  users,
  isVideoEnabled,
  isAudioEnabled,
  localUserId,
  isConnected,
}) => {
  return (
    <div className="h-full w-full flex flex-col p-4">
      <div className="flex-1 flex flex-col justify-center items-center">
        {users.length < 2 && isConnected && (
          <div className="text-center text-slate-500">
            <p className="text-lg">Waiting for others to join...</p>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center">
        <VideoGrid
          localStream={localStream}
          remoteStreams={remoteStreams}
          users={users}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          localUserId={localUserId}
        />
      </div>
    </div>
  );
};
