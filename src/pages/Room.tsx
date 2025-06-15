import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/hooks/useRoom';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Toaster } from '@/components/ui/toaster';
import { RoomHeader } from '@/components/room/RoomHeader';
import { VideoConference } from '@/components/room/VideoConference';
import { SidePanel } from '@/components/room/SidePanel';

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
      userData?.userId || '',
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
    localVideoRef,
  } = useWebRTC(roomId!, userData?.userId || '', isConnected);


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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Toaster />
      <div className="container mx-auto p-4 flex-1 flex flex-col min-h-0">
        <RoomHeader
          roomTitle={roomTitle}
          roomId={roomId!}
          roomData={roomData}
          isConnected={isConnected}
          onLeaveRoom={handleLeaveRoom}
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          <div className="lg:col-span-3 h-full min-h-0">
            <VideoConference
              localStream={localStream}
              remoteStreams={remoteStreams}
              users={users}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              localUserId={userData.userId}
              isScreenSharing={isScreenSharing}
              toggleAudio={toggleAudio}
              toggleVideo={toggleVideo}
              startScreenShare={startScreenShare}
              isConnected={isConnected}
              localVideoRef={localVideoRef}
            />
          </div>
          <div className="lg:col-span-1 flex flex-col h-full min-h-0">
            <SidePanel
              messages={messages}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              onSendMessage={handleSendMessage}
              users={users}
              ownerId={ownerId}
              currentUserId={userData.userId}
              isOwner={isOwner}
              onKickUser={kickUser}
              onViewProfile={(userId) => console.log('View profile:', userId)}
              isConnected={isConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
