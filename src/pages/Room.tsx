
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
import { Send, Users, Crown, UserMinus, LogOut, Mic, MicOff, Video, VideoOff, UserPlus, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log('Room component loaded with roomId:', roomId);
  
  // Mock user data - in real app, get from auth context
  const [currentUser] = useState({
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    name: 'User ' + Math.random().toString(36).substr(2, 5),
    photo: null,
  });

  console.log('Current user:', currentUser);

  const [roomTitle, setRoomTitle] = useState('Study Room');
  const [roomData, setRoomData] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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
  } = useRoom(roomId || '', currentUser.id, currentUser.name, roomTitle);

  console.log('Room hook state:', { users, ownerId, messages, isConnected, isOwner });

  // Fetch current user's social connections
  const { data: currentUserData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/user-data', {
          withCredentials: true,
        });
        return response.data.user;
      } catch (error) {
        console.log('Failed to fetch user data, using mock data');
        return null;
      }
    },
  });

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

  const handleFollowUser = async (userId: string) => {
    try {
      await axios.post(`http://localhost:3000/users/${userId}/follow`, {}, {
        withCredentials: true,
      });
      toast({
        title: "User Followed",
        description: "You are now following this user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await axios.post(`http://localhost:3000/users/${userId}/friend`, {}, {
        withCredentials: true,
      });
      toast({
        title: "Friend Request Sent",
        description: "Friend request has been sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const handleLikeUser = async (userId: string) => {
    try {
      await axios.post(`http://localhost:3000/users/${userId}/likes`, {}, {
        withCredentials: true,
      });
      toast({
        title: "User Liked",
        description: "You liked this user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like user",
        variant: "destructive",
      });
    }
  };

  const isUserFollowed = (userId: string) => {
    return currentUserData?.following?.includes(userId) || false;
  };

  const isUserFriend = (userId: string) => {
    return currentUserData?.friends?.includes(userId) || false;
  };

  const handleLeaveRoom = () => {
    navigate('/rooms');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log('Mute toggled:', !isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    console.log('Video toggled:', !isVideoOff);
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
            <CardContent className="flex-1">
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Video conference area</p>
                  <p className="text-sm text-muted-foreground">
                    Connection Status: {isConnected ? "Connected" : "Connecting..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Users in room: {users.length}
                  </p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  variant={isVideoOff ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleVideo}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </Button>
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
                      {isConnected ? "No users connected" : "Connecting to room..."}
                    </p>
                  ) : (
                    users.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-2 rounded-lg border">
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
                        
                        {user.userId !== currentUser.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleLikeUser(user.userId)}
                              className="h-6 w-6"
                            >
                              <Heart className="w-3 h-3" />
                            </Button>
                            
                            {!isUserFollowed(user.userId) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleFollowUser(user.userId)}
                                className="h-6 w-6"
                              >
                                <UserPlus className="w-3 h-3" />
                              </Button>
                            )}
                            
                            {!isUserFriend(user.userId) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAddFriend(user.userId)}
                                className="h-6 w-6"
                                title="Add Friend"
                              >
                                <Users className="w-3 h-3" />
                              </Button>
                            )}
                            
                            {isOwner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleKickUser(user.userId)}
                                className="h-6 w-6"
                              >
                                <UserMinus className="w-3 h-3" />
                              </Button>
                            )}
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
    </div>
  );
};

export default Room;
