import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useWebRTC } from '@/hooks/useWebRTC';
import { UserProfileModal } from '@/components/userProfileModal';
import { RoomHeader } from '@/components/room/RoomHeader';
import { VideoConference } from '@/components/room/VideoConference';
import { ParticipantsPanel } from '@/components/room/ParticipantsPanel';
import { ChatPanel } from '@/components/room/ChatPanel';

// Helper function to generate a valid MongoDB ObjectId format
const generateObjectId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const objectId = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
    return Math.floor(Math.random() * 16).toString(16);
  }).toLowerCase();
  return objectId;
};

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log('Room component loaded with roomId:', roomId);
  
  // Try to get authenticated user data first
  const { data: authUser, isLoading: isLoadingAuth } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/user-data', {
          withCredentials: true,
        });
        console.log('Auth user data:', response.data);
        return response.data.user;
      } catch (error) {
        console.log('No authenticated user found:', error);
        return null;
      }
    },
  });

  // Create current user object based on auth status
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; photo: string | null } | null>(null);

  // Update current user when auth data loads
  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        id: authUser._id || authUser.id,
        name: authUser.name || 'User',
        photo: authUser.photo || null,
      });
      console.log('Updated current user from auth:', authUser);
    }
  }, [authUser]);

  console.log('Current user:', currentUser);

  const [roomTitle, setRoomTitle] = useState('Study Room');
  const [roomData, setRoomData] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  // Fetch room data first
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;
      
      try {
        console.log('Fetching room data for:', roomId);
        const response = await axios.get(`http://localhost:3000/rooms/${roomId}`, {
          withCredentials: true,
        });
        
        console.log('Room data response:', response.data);
        
        if (response.data.success) {
          setRoomData(response.data.room);
          setRoomTitle(response.data.room.title || 'Study Room');
        } else {
          console.error('Failed to fetch room data');
          toast({
            title: "Error",
            description: "Room not found",
            variant: "destructive",
          });
          navigate('/rooms');
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
        toast({
          title: "Error", 
          description: "Failed to load room data",
          variant: "destructive",
        });
        navigate('/rooms');
      } finally {
        setIsLoadingRoom(false);
      }
    };

    fetchRoomData();
  }, [roomId, navigate, toast]);

  const {
    users,
    ownerId,
    messages,
    isConnected,
    sendMessage,
    kickUser,
    isOwner,
  } = useRoom(roomId || '', currentUser?.id || '', currentUser?.name || 'Guest', roomTitle);

  // Initialize WebRTC
  const {
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    localVideoRef,
    initializeLocalStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
  } = useWebRTC(roomId || '', currentUser?.id || '');

  // Initialize local stream
  useEffect(() => {
    if (currentUser?.id && isConnected) {
      initializeLocalStream().catch(err => {
        console.error("Error initializing local stream", err);
        toast({
          title: "Camera/Mic Error",
          description: "Could not access your camera or microphone. Please check permissions.",
          variant: "destructive"
        })
      })
    }
  }, [currentUser, isConnected, initializeLocalStream, toast]);

  console.log('Room hook state:', { users, ownerId, messages, isConnected, isOwner });

  // Fetch current user's social connections
  const { data: currentUserData } = useQuery({
    queryKey: ['currentUserConnections'],
    queryFn: async () => {
      if (!authUser) return null;
      try {
        const response = await axios.get('http://localhost:3000/auth/user-data', {
          withCredentials: true,
        });
        return response.data.user;
      } catch (error) {
        console.log('Failed to fetch user connections');
        return null;
      }
    },
    enabled: !!authUser,
  });

  // Show loading while auth is being checked
  if (isLoadingAuth || !currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login prompt if no authenticated user
  if (!authUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Authentication Required</h2>
              <p>Please log in to join this room.</p>
              <Button onClick={() => navigate('/auth')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't try to connect to room if we don't have a valid user ID
  if (!currentUser.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Loading user data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput.trim());
      sendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const handleKickUser = (userId: string) => {
    if (isOwner && userId !== currentUser.id) {
      kickUser(userId);
      toast({
        title: "User Kicked",
        description: "User has been removed from the room",
      });
    }
  };

  const handleViewProfile = async (userId: string) => {
    if (userId === currentUser.id) return;
    try {
      const response = await axios.get(`http://localhost:3000/users/${userId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setSelectedUser(response.data.user);
        setProfileModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Could not fetch user profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user profile.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveRoom = () => {
    navigate('/rooms');
  };

  if (!roomId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Room ID not found</p>
            <Button onClick={() => navigate('/rooms')} className="mt-4">
              Back to Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingRoom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Loading room...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      <RoomHeader
        roomTitle={roomTitle}
        roomId={roomId!}
        roomData={roomData}
        isConnected={isConnected}
        onLeaveRoom={handleLeaveRoom}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Video Area */}
        <div className="lg:col-span-3">
          <VideoConference
            localVideoRef={localVideoRef}
            localStream={localStream}
            remoteStreams={remoteStreams}
            users={users}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            localUserId={currentUser.id}
            isScreenSharing={isScreenSharing}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            startScreenShare={startScreenShare}
            isConnected={isConnected}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6 flex flex-col">
          <ParticipantsPanel
            users={users}
            ownerId={ownerId}
            currentUserId={currentUser.id}
            isOwner={isOwner}
            isConnected={isConnected}
            onKickUser={handleKickUser}
            onViewProfile={handleViewProfile}
          />

          <ChatPanel
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
          />
        </div>
      </div>
      {selectedUser && currentUser && (
        <UserProfileModal 
          user={selectedUser}
          currentUserId={currentUser.id}
          isOpen={isProfileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Room;
