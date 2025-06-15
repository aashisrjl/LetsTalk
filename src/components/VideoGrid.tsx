
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  users: Array<{
    userId: string;
    userName: string;
    photo?: string;
  }>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localVideoRef,
  localStream,
  remoteStreams,
  users,
  isVideoEnabled,
  isAudioEnabled,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      {/* Local video */}
      <Card className="relative overflow-hidden">
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Avatar className="w-16 h-16 mb-2">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">You</p>
            </div>
          )}
        </div>
        
        {/* Local controls overlay */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <div className={`p-1 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
            {isAudioEnabled ? (
              <Mic className="w-3 h-3 text-white" />
            ) : (
              <MicOff className="w-3 h-3 text-white" />
            )}
          </div>
          <div className={`p-1 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
            {isVideoEnabled ? (
              <Video className="w-3 h-3 text-white" />
            ) : (
              <VideoOff className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          You
        </div>
      </Card>

      {/* Remote videos */}
      {users.map((user) => {
        const stream = remoteStreams.get(user.userId);
        return (
          <Card key={user.userId} className="relative overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {stream ? (
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(videoElement) => {
                    if (videoElement && stream) {
                      videoElement.srcObject = stream;
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Avatar className="w-16 h-16 mb-2">
                    <AvatarImage src={user.photo} />
                    <AvatarFallback>
                      {user.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-muted-foreground">{user.userName}</p>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {user.userName}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
