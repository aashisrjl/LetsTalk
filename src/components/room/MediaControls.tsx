import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, MonitorUp, MonitorDown, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  streamError?: string | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onScreenShare: () => void;
  onLeaveRoom: () => void;
}

export const MediaControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  localStream,
  streamError,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
  onLeaveRoom,
}: MediaControlsProps) => {
  const { toast } = useToast();
  const [isAudioButtonDisabled, setIsAudioButtonDisabled] = useState(false);
  const [isVideoButtonDisabled, setIsVideoButtonDisabled] = useState(false);
  const [isScreenShareButtonDisabled, setIsScreenShareButtonDisabled] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (streamError && streamError !== lastError) {
      setLastError(streamError);
      toast({
        title: 'Media Error',
        description: streamError,
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [streamError, toast, lastError]);

  const handleToggleAudio = async () => {
    setIsAudioButtonDisabled(true);
    try {
      await onToggleAudio();
    } catch (error) {
      toast({
        title: 'Audio Error',
        description: 'Failed to toggle audio',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setIsAudioButtonDisabled(false), 1000);
    }
  };

  const handleToggleVideo = async () => {
    setIsVideoButtonDisabled(true);
    try {
      await onToggleVideo();
    } catch (error) {
      toast({
        title: 'Video Error',
        description: 'Failed to toggle video',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setIsVideoButtonDisabled(false), 1000);
    }
  };

  const handleScreenShare = async () => {
    setIsScreenShareButtonDisabled(true);
    try {
      await onScreenShare();
    } catch (error) {
      toast({
        title: 'Screen Share Error',
        description: 'Failed to toggle screen sharing',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setIsScreenShareButtonDisabled(false), 1000);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-full shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleAudio}
        disabled={isAudioButtonDisabled}
        className={`rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'} hover:bg-opacity-80 transition-colors`}
      >
        {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleVideo}
        disabled={isVideoButtonDisabled}
        className={`rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'} hover:bg-opacity-80 transition-colors`}
      >
        {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleScreenShare}
        disabled={isScreenShareButtonDisabled}
        className={`rounded-full ${isScreenSharing ? 'bg-red-500' : 'bg-slate-600'} hover:bg-opacity-80 transition-colors`}
      >
        {isScreenSharing ? <MonitorDown className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={onLeaveRoom}
        className="rounded-full bg-red-600 hover:bg-red-700 transition-colors"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};