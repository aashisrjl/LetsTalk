
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface MediaControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onScreenShare: () => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  localStream,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
}) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant={isAudioEnabled ? "outline" : "destructive"}
        size="icon"
        onClick={onToggleAudio}
        disabled={!localStream}
      >
        {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </Button>
      <Button
        variant={isVideoEnabled ? "outline" : "destructive"}
        size="icon"
        onClick={onToggleVideo}
        disabled={!localStream}
      >
        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
      </Button>
      <Button
        variant="outline"
        onClick={onScreenShare}
        disabled={!localStream}
        className="text-sm"
      >
        {isScreenSharing ? "Stop Sharing" : "Share Screen"}
      </Button>
    </div>
  );
};
