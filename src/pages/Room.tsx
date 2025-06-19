import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
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

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user: userData, isLoading, isAuthenticated } = useAuth();
  const [roomTitle, setRoomTitle] = useState('Language Room');
  const [roomData, setRoomData] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');

  console.log('Room.tsx - roomId:', roomId, 'userData:', userData, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/rooms/${roomId}`, {
          withCredentials: true,
        });
        console.log('Room data fetched:', response.data);
        if (response.data.success && response.data.room) {
          setRoomTitle(response.data.room.title);
          setRoomData(response.data.room);
        } else {
          console.error('Failed to fetch room data:', response.data.message);
          navigate('/rooms');
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
        navigate('/rooms');
      }
    };

    if (roomId && userData?.id) {
      fetchRoomData();
    }
  }, [roomId, userData, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-100">
        Loading user data...
      </div>
    );
  }

  if (!userData || !userData.id || !userData.name || !isAuthenticated) {
    console.warn('Redirecting to login: Invalid userData or not authenticated', userData);
    return <Navigate to="/login" replace />;
  }

  if (!roomId) {
    console.warn('Redirecting to rooms: Missing roomId');
    return <Navigate to="/rooms" replace />;
  }

  const { users, ownerId, messages, isConnected, sendMessage, kickUser, isOwner } = useRoom(
    roomId,
    userData.id,
    userData.name,
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
  } = useWebRTC(roomId, userData.id);

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

  if (!roomData) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-100">
        Loading room data...
      </div>
    );
  }

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
            localUserId={userData.id}
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
          currentUserId={userData.id}
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