import React from 'react';
import { VideoGrid } from '@/components/VideoGrid';

interface User {
  userId: string;
  userName: string;
  photo?: string;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
}

interface RemoteStream {
  userId: string;
  stream: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

interface VideoConferenceProps {
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];
  users: User[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  localUserId: string;
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  localStream,
  remoteStreams,
  users,
  isVideoEnabled,
  isAudioEnabled,
  localUserId,
}) => {
  return (
    <div className="h-full w-full flex justify-center items-center p-4">
      <VideoGrid
        localStream={localStream}
        remoteStreams={remoteStreams}
        users={users}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        localUserId={localUserId}
      />
    </div>
  );
};