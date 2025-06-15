
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';

interface MediaControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onScreenShare: () => void;
  onLeaveRoom: () => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  localStream,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
  onLeaveRoom,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 bg-slate-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-slate-700">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleAudio}
        disabled={!localStream}
        className="rounded-full w-10 h-10 hover:bg-slate-700 text-white"
      >
        {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-400" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleVideo}
        disabled={!localStream}
        className="rounded-full w-10 h-10 hover:bg-slate-700 text-white"
      >
        {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-red-400" />}
      </Button>
      <Button
        variant="ghost"
        onClick={onScreenShare}
        disabled={!localStream}
        className="rounded-full h-10 px-4 hover:bg-slate-700 text-white data-[active=true]:bg-blue-600"
        data-active={isScreenSharing}
      >
        {isScreenSharing ? "Stop Sharing" : "Share Screen"}
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={onLeaveRoom}
        className="rounded-full w-10 h-10 ml-2"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
};
