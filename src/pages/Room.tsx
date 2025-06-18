import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/hooks/useRoom';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Toaster } from '@/components/ui/toaster';
import { VideoConference } from '@/components/room/VideoConference';
import { SidePanel } from '@/components/room/SidePanel';
import { MediaControls } from '@/components/room/MediaControls';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user: userData } = useAuth();
  const [roomTitle, setRoomTitle] = useState('Language Room');
  const [roomData, setRoomData] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/rooms/${roomId}`, {
          withCredentials: true,
        });
        if (response.data.success && response.data.room) {
          setRoomTitle(response.data.room.title);
          setRoomData(response.data.room);
        } else {
          console.error('Failed to fetch room data:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  const { users, ownerId, messages, isConnected, sendMessage, kickUser, isOwner } =
    useRoom(
      roomId!,
      (userData as any)?.id || '',
      userData?.name || 'Anonymous',
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
  } = useWebRTC(roomId!, (userData as any)?.id || '');


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

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading user data...
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
            <VideoConference
              localStream={localStream}
              remoteStreams={remoteStreams}
              users={users}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              localUserId={(userData as any).id}
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
          currentUserId={(userData as any).id}
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
