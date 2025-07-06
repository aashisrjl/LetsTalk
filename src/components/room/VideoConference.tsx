import React, { useEffect, useRef } from 'react';

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

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];
  users: User[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  localUserId: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  users,
  isVideoEnabled,
  isAudioEnabled,
  localUserId,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true; // Mute local video to prevent feedback
      localVideoRef.current.play().catch((error) => {
        console.error('Error playing local video:', error);
      });
    }
  }, [localStream]);

  useEffect(() => {
    remoteStreams.forEach(({ userId, stream }) => {
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play().catch((error) => {
          console.error(`Error playing remote video for user ${userId}:`, error);
        });
      }
    });
  }, [remoteStreams]);

  const getUserDisplayName = (userId: string) => {
    const user = users.find((u) => u.userId === userId);
    return user ? user.userName : 'Unknown User';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full h-full">
      {/* Local Stream */}
      {localStream && (
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoEnabled ? '' : 'hidden'}`}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <span>Video Off ({getUserDisplayName(localUserId)})</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            {getUserDisplayName(localUserId)} {isAudioEnabled ? '(Mic On)' : '(Mic Off)'}
          </div>
        </div>
      )}

      {/* Remote Streams */}
      {remoteStreams.map(({ userId, stream, isVideoEnabled: remoteVideoEnabled, isAudioEnabled: remoteAudioEnabled }) => (
        <div key={userId} className="relative bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            ref={(el) => {
              if (el) remoteVideoRefs.current.set(userId, el);
              else remoteVideoRefs.current.delete(userId);
            }}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${remoteVideoEnabled ? '' : 'hidden'}`}
          />
          {!remoteVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <span>Video Off ({getUserDisplayName(userId)})</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            {getUserDisplayName(userId)} {remoteAudioEnabled ? '(Mic On)' : '(Mic Off)'}
          </div>
        </div>
      ))}
    </div>
  );
};