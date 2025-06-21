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
  const [messageInput, setMessageInput] = useState('');

  // Memoize userData to prevent reference changes
  const stableUserData = useMemo(
    () => userData ? { id: userData.id, name: userData.name, photo: userData.photo } : null,
    [userData?.id, userData?.name, userData?.photo]
  );

  console.log('Room.tsx - roomId:', roomId, 'stableUserData:', stableUserData, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  const { data: roomData, isLoading: isRoomLoading, error: roomError } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => fetchRoomData(roomId!),
    enabled: !!roomId && !!stableUserData?.id && isAuthenticated,
  });

  if (isLoading || isRoomLoading) {
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

  if (roomError) {
    console.error('Room fetch error:', roomError.message);
    navigate('/rooms');
    return null;
  }

  if (!roomData) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-100">
        Loading room data...
      </div>
    );
  }

  const roomTitle = roomData.title || 'Language Room';

  const { users, ownerId, messages, isConnected, sendMessage, kickUser, isOwner } = useRoom(
    roomId,
    stableUserData.id,
    stableUserData.name,
    roomTitle
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

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      <Toaster />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <MediaControls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
            localStream={localStream}
            
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onScreenShare={startScreenShare}
            onLeaveRoom={handleLeaveRoom}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
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
      <div className="w-[350px] bg-slate-800/50 border-l border-slate-700 h-full flex flex-col">
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
          onViewProfile={(userId) => console.log('View profile:', userId)}
          isConnected={isConnected}
          roomData={roomData}
        />
      </div>
    </div>
  );
};

export default Room;