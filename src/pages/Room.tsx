
import { useState, useMemo } from 'react';
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
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email?: string;
  photo?: string;
}

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
  const { user: userData, isLoading, isAuthenticated } = useAuth();

  // State for SidePanel toggle on small screens
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const stableUserData = useMemo(
    () => (userData ? { id: userData.id, name: userData.name, photo: userData.photo } : null),
    [userData?.id, userData?.name, userData?.photo]
  );

  // Early returns BEFORE hooks to prevent mount/unmount cycles
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-100">
        Loading...
      </div>
    );
  }

  if (!stableUserData || !stableUserData.id || !stableUserData.name || !isAuthenticated) {
    console.warn('Redirecting to login: Invalid userData or not authenticated', stableUserData);
    return <Navigate to="/login" replace />;
  }

  if (!roomId) {
    console.warn('Redirecting to rooms: Missing roomId');
    return <Navigate to="/rooms" replace />;
  }

  const [messageInput, setMessageInput] = useState('');
  const { data: roomData, isLoading: isRoomLoading, error: roomError } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => fetchRoomData(roomId!),
    enabled: !!roomId && !!stableUserData?.id && isAuthenticated,
  });

  // Stabilize roomTitle to prevent useRoom re-initializations
  const stableRoomTitle = useMemo(() => {
    return roomData?.title || 'Language Room';
  }, [roomData?.title]);

  // Room loading check after room query
  if (isRoomLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-100">
        Loading room...
      </div>
    );
  }

  if (roomError) {
    console.error('Room fetch error:', roomError.message);
    navigate('/rooms');
    return null;
  }

  // Hooks called only when all conditions are met
  const { users, ownerId, messages, isConnected, sendMessage, kickUser, isOwner } = useRoom(
    roomId,
    stableUserData.id,
    stableUserData.name,
    stableRoomTitle
  );

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

  console.log('Room.tsx - roomId:', roomId, 'stableUserData:', stableUserData, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'roomTitle:', stableRoomTitle);

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

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden">
      <Toaster />
      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Hamburger menu for small screens */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden absolute top-4 right-4 z-30 text-slate-100"
          onClick={toggleSidePanel}
          aria-label={isSidePanelOpen ? 'Close side panel' : 'Open side panel'}
        >
          {isSidePanelOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Media controls */}
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

        {/* Video grid */}
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
      </div>

      {/* SidePanel for large screens, hidden by default on small screens */}
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
          // onViewProfile={(userId) => console.log('View profile:', userId)}
          isConnected={isConnected}
          roomData={roomData}
        />
      </div>

      {/* Backdrop for small screens when SidePanel is open */}
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
