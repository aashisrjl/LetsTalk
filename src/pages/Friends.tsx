
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Heart, UserMinus, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const Friends = () => {
  const { toast } = useToast();

  // Fetch current user's social data
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['currentUserSocial'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/auth/user-data', {
        withCredentials: true,
      });
      return response.data.user;
    },
  });

  // Fetch detailed friend data
  const { data: friendsData } = useQuery({
    queryKey: ['friendsDetails', userData?.friends],
    queryFn: async () => {
      if (!userData?.friends?.length) return [];
      
      const friendPromises = userData.friends.map((friendId: string) =>
        axios.get(`http://localhost:3000/users/${friendId}`, {
          withCredentials: true,
        })
      );
      
      const responses = await Promise.all(friendPromises);
      return responses.map(response => response.data.user);
    },
    enabled: !!userData?.friends?.length,
  });

  // Fetch detailed follower data
  const { data: followersData } = useQuery({
    queryKey: ['followersDetails', userData?.followers],
    queryFn: async () => {
      if (!userData?.followers?.length) return [];
      
      const followerPromises = userData.followers.map((followerId: string) =>
        axios.get(`http://localhost:3000/users/${followerId}`, {
          withCredentials: true,
        })
      );
      
      const responses = await Promise.all(followerPromises);
      return responses.map(response => response.data.user);
    },
    enabled: !!userData?.followers?.length,
  });

  // Fetch detailed following data
  const { data: followingData } = useQuery({
    queryKey: ['followingDetails', userData?.following],
    queryFn: async () => {
      if (!userData?.following?.length) return [];
      
      const followingPromises = userData.following.map((followingId: string) =>
        axios.get(`http://localhost:3000/users/${followingId}`, {
          withCredentials: true,
        })
      );
      
      const responses = await Promise.all(followingPromises);
      return responses.map(response => response.data.user);
    },
    enabled: !!userData?.following?.length,
  });

  const handleUnfriend = async (userId: string) => {
    try {
      await axios.post(`http://localhost:3000/users/${userId}/unfriend`, {}, {
        withCredentials: true,
      });
      toast({
        title: "Friend Removed",
        description: "User has been removed from your friends list",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await axios.post(`http://localhost:3000/users/${userId}/unfollow`, {}, {
        withCredentials: true,
      });
      toast({
        title: "Unfollowed",
        description: "You are no longer following this user",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Social Connections
        </h1>
        <p className="text-muted-foreground">
          Manage your friends and followers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.friends?.length || 0}</div>
            <p className="text-muted-foreground">Total friends</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.followers?.length || 0}</div>
            <p className="text-muted-foreground">People following you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Following
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.following?.length || 0}</div>
            <p className="text-muted-foreground">People you follow</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {friendsData?.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {friendsData.map((friend: any) => (
                      <div key={friend.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friend.photo} />
                            <AvatarFallback>
                              {friend.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-sm text-muted-foreground">{friend.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleUnfriend(friend.id)}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No friends yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>Your Followers</CardTitle>
            </CardHeader>
            <CardContent>
              {followersData?.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {followersData.map((follower: any) => (
                      <div key={follower.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={follower.photo} />
                            <AvatarFallback>
                              {follower.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{follower.name}</p>
                            <p className="text-sm text-muted-foreground">{follower.location}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Follower</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No followers yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following">
          <Card>
            <CardHeader>
              <CardTitle>People You Follow</CardTitle>
            </CardHeader>
            <CardContent>
              {followingData?.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {followingData.map((following: any) => (
                      <div key={following.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={following.photo} />
                            <AvatarFallback>
                              {following.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{following.name}</p>
                            <p className="text-sm text-muted-foreground">{following.location}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUnfollow(following.id)}
                        >
                          Unfollow
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Not following anyone yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
