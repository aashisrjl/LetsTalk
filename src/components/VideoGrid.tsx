import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';

interface RemoteStream {
  userId: string;
  stream: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];
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
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const totalCells = users.length === 1 ? 2 : users.length;
  const layoutClass = getGridLayout(totalCells);

  return (
    <div className={`grid ${layoutClass} gap-4 w-full max-w-7xl`}>
      {/* Local video */}
      <Card className="relative overflow-hidden aspect-video bg-slate-800">
        <div className="w-full h-full flex items-center justify-center">
          {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300">
              <Avatar className="w-16 h-16 mb-2">
                <AvatarFallback className="bg-slate-700">You</AvatarFallback>
              </Avatar>
              <p className="text-sm">You</p>
            </div>
          )}
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1">
          <div className={`p-1 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
            {isAudioEnabled ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
          </div>
          <div className={`p-1 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
            {isVideoEnabled ? <Video className="w-3 h-3 text-white" /> : <VideoOff className="w-3 h-3 text-white" />}
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
          const remoteStream = remoteStreams.find((rs) => rs.userId === user.userId);
          // Use remoteStream states, fall back to socketRoom defaults
          const isRemoteVideoEnabled = remoteStream?.isVideoEnabled ?? user.isVideoEnabled ?? false;
          const isRemoteAudioEnabled = remoteStream?.isAudioEnabled ?? user.isAudioEnabled ?? false;

          return (
            <Card key={user.userId} className="relative overflow-hidden aspect-video bg-slate-800">
              <div className="w-full h-full flex items-center justify-center">
                {remoteStream?.stream && isRemoteVideoEnabled ? (
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(videoElement) => {
                      if (videoElement && remoteStream?.stream) {
                        videoElement.srcObject = remoteStream.stream;
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <Avatar className="w-16 h-16 mb-2">
                      <AvatarImage src={user.photo} />
                      <AvatarFallback className="bg-slate-700">
                        {user.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm">{user.userName}</p>
                    {!isRemoteVideoEnabled && <p className="text-xs text-slate-400 mt-1">Video Off</p>}
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

      {users.length === 1 && (
        <Card className="aspect-video relative overflow-hidden border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center mb-3">
              <Users className="h-8 w-8 text-slate-600" />
            </div>
            <p className="font-medium">Waiting for others...</p>
            <p className="text-xs">Invite someone to join you.</p>
          </div>
        </Card>
      )}
    </div>
  );
};