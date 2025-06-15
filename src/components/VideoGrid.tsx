
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  users: Array<{
    userId: string;
    userName: string;
    photo?: string;
    isAudioEnabled?: boolean;
    isVideoEnabled?: boolean;
  }>;
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
  const localVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const getGridLayout = (count: number) => {
    if (count <= 1) return "grid-cols-1";
    if (count <= 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2"; // 2x2 for 3-4 users
    if (count <= 6) return "grid-cols-3"; // 2x3 for 5-6 users
    if (count <= 9) return "grid-cols-3"; // 3x3 for 7-9 users
    return "grid-cols-4"; // 4x4 for more
  };

  const layoutClass = getGridLayout(users.length);

  return (
    <div className={`grid ${layoutClass} gap-4 h-full`}>
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
      {users
        .filter((user) => user.userId !== localUserId)
        .map((user) => {
          const stream = remoteStreams.get(user.userId);
          const isRemoteVideoEnabled = user.isVideoEnabled !== false;
          const isRemoteAudioEnabled = user.isAudioEnabled !== false;

          return (
            <Card key={user.userId} className="relative overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {stream && isRemoteVideoEnabled ? (
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
                    {!isRemoteVideoEnabled && <p className="text-xs text-muted-foreground mt-1">Video Off</p>}
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-2 left-2 flex gap-1 z-10">
                <div className={`p-1 rounded-full ${isRemoteAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isRemoteAudioEnabled ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
                </div>
                <div className={`p-1 rounded-full ${isRemoteVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isRemoteVideoEnabled ? <Video className="w-3 h-3 text-white" /> : <VideoOff className="w-3 h-3 text-white" />}
                </div>
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
