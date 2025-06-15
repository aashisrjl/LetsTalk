import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Users, Crown, UserMinus, LogOut, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoGrid } from '@/components/VideoGrid';
import { UserProfileModal } from '@/components/userProfileModal';

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
  const { data: authUser, isLoading: isLoadingAuth, error: authError } = useQuery({
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
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
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

  const handleToggleMute = () => {
    toggleAudio();
    console.log('Audio toggled:', !isAudioEnabled);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    console.log('Video toggled:', !isVideoEnabled);
  };

  const handleScreenShare = () => {
    startScreenShare();
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{roomTitle}</h1>
          <p className="text-muted-foreground">Room ID: {roomId}</p>
          {roomData && (
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{roomData.language}</Badge>
              <Badge variant="outline">{roomData.level}</Badge>
              <Badge variant="outline">{roomData.participants?.length || 0}/{roomData.maxParticipants} participants</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button variant="outline" onClick={handleLeaveRoom}>
            <LogOut className="w-4 h-4 mr-2" />
            Leave Room
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Conference
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <div className="h-96 mb-4">
                <VideoGrid
                  localVideoRef={localVideoRef}
                  localStream={localStream}
                  remoteStreams={remoteStreams}
                  users={users}
                  isVideoEnabled={isVideoEnabled}
                  isAudioEnabled={isAudioEnabled}
                  localUserId={currentUser.id}
                />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isAudioEnabled ? "outline" : "destructive"}
                  size="icon"
                  onClick={handleToggleMute}
                  disabled={!localStream}
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant={isVideoEnabled ? "outline" : "destructive"}
                  size="icon"
                  onClick={handleToggleVideo}
                  disabled={!localStream}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleScreenShare}
                  disabled={!localStream}
                  className="text-sm"
                >
                  {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                </Button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Connection: {isConnected ? "Connected" : "Connecting..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Users in room: {users.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {users.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isConnected ? "No other users connected" : "Connecting to room..."}
                    </p>
                  ) : (
                    users.map((user) => (
                      <div 
                        key={user.userId} 
                        className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-muted"
                        onClick={() => handleViewProfile(user.userId)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.photo} />
                            <AvatarFallback>
                              {user.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{user.userName}</p>
                            {user.userId === ownerId && (
                              <Crown className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        
                        {user.userId !== currentUser.id && isOwner && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleKickUser(user.userId)
                              }}
                              className="h-6 w-6"
                            >
                              <UserMinus className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className="p-2 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">{msg.userName}</p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.time).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <Separator />
              
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={!isConnected}
                />
                <Button type="submit" size="icon" disabled={!isConnected || !messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              {!isConnected && (
                <p className="text-xs text-muted-foreground text-center">
                  Connecting to chat...
                </p>
              )}
            </CardContent>
          </Card>
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
