import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/hooks/useRoom';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Toaster } from '@/components/ui/toaster';
import { VideoGrid } from '@/components/VideoGrid';
import { SidePanel } from '@/components/room/SidePanel';
import { MediaControls } from '@/components/room/MediaControls';
import { Menu, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email?: string;
  photo?: string;
}

const Spinner = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center h-screen text-slate-100">
    <div className="flex flex-col items-center gap-4">
      <div
        className="h-12 w-12 rounded-full border-4 border-slate-700 border-t-sky-400 animate-spin"
        aria-label="Loading"
      />
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </div>
  </div>
);

const fetchRoomData = async (roomId: string) => {
  const response = await axios.get(`http://localhost:3000/rooms/${roomId}`, {
    withCredentials: true,
  });
  if (!response.data.success || !response.data.room) {
    throw new Error(response.data.message || 'Failed to fetch room data');
  }
  return response.data.room;
};

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user: userData, isLoading: authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <Spinner label="Loading..." />;
  }

  if (!isAuthenticated || !userData?.id || !userData?.name) {
    console.warn('Redirecting to login: Invalid userData or not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (!roomId) {
    console.warn('Redirecting to rooms: Missing roomId');
    return <Navigate to="/rooms" replace />;
  }

  const stableUserData = {
    id: userData.id,
    name: userData.name,
    photo: userData.photo,
  };

  return <RoomContent roomId={roomId} stableUserData={stableUserData} isAuthenticated={isAuthenticated} />;
};

const RoomContent = ({ roomId, stableUserData, isAuthenticated }: {
  roomId: string;
  stableUserData: { id: string; name: string; photo?: string };
  isAuthenticated: boolean;
}) => {
  const navigate = useNavigate();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  const { data: roomData, isLoading: isRoomLoading, error: roomError } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => fetchRoomData(roomId),
    enabled: !!roomId && !!stableUserData.id && isAuthenticated,
    retry: 1,
  });

  const stableRoomTitle = useMemo(() => roomData?.title || 'Language Room', [roomData?.title]);

  const {
    users,
    ownerId,
    messages,
    isConnected,
    sendMessage,
    kickUser,
    isOwner,
    isLoading: roomLoading,
  } = useRoom(roomId, stableUserData.id, stableUserData.name, stableRoomTitle);

  const {
    localStream,
    remoteStreams,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    streamError,
  } = useWebRTC(roomId, stableUserData.id, isConnected);

  useEffect(() => {
    if (!hasInitialized && !isRoomLoading && !roomLoading && isConnected) {
      setHasInitialized(true);
      console.log('RoomContent: Initialized with room data');
    }
  }, [hasInitialized, isRoomLoading, roomLoading, isConnected]);

  if (isRoomLoading || roomLoading) {
    return <Spinner label="Loading room..." />;
  }

  if (roomError) {
    console.error('Room fetch error:', roomError.message);
    navigate('/rooms');
    return null;
  }

  if (!isConnected && hasInitialized) {
    return <Spinner label="Reconnecting to room..." />;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleLeaveRoom = () => {
    navigate('/rooms');
  };

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const handleCopyRoomLink = async () => {
    const link = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Room link copied', description: 'Share it with others.' });
    } catch (e) {
      console.error('Failed to copy link:', e);
      toast({ title: 'Copy failed', description: link, variant: 'destructive' });
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden">
      <Toaster />
      <div className="flex-1 flex flex-col relative">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden absolute top-4 right-4 z-30 text-slate-100"
          onClick={toggleSidePanel}
          aria-label={isSidePanelOpen ? 'Close side panel' : 'Open side panel'}
        >
          {isSidePanelOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col sm:flex-row gap-2">
          <MediaControls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
            localStream={localStream}
            streamError={streamError}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onScreenShare={startScreenShare}
            onLeaveRoom={handleLeaveRoom}
          />
        </div>
        <div className="flex-1 flex items-center justify-center w-full h-full">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            users={users}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            localUserId={stableUserData.id}
          />
        </div>
        {streamError && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white p-2 rounded z-30">
            {streamError}
          </div>
        )}
      </div>
      <div
        className={`fixed md:static inset-y-0 right-0 w-[300px] sm:w-[350px] bg-slate-800/50 border-l border-slate-700 transform transition-transform duration-300 ease-in-out z-40
          ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <SidePanel
          messages={messages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSendMessage={handleSendMessage}
          users={users}
          ownerId={ownerId}
          currentUserId={stableUserData.id}
          isOwner={isOwner}
          onKickUser={kickUser}
          isConnected={isConnected}
          roomData={roomData}
        />
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleCopyRoomLink}
          className="rounded-full shadow-lg px-4 py-6 gap-2"
          aria-label="Copy room link"
        >
          <Copy className="h-5 w-5" />
          <span className="hidden sm:inline">Copy room link</span>
        </Button>
      </div>
      {isSidePanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidePanel}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Room;