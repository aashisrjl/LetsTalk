
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, UserPlus, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const Followers = () => {
  const { toast } = useToast();

  // Fetch current user's follower data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['currentUserFollowers'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/auth/user-data', {
        withCredentials: true,
      });
      return response.data.user;
    },
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

  const handleFollowBack = async (userId: string) => {
    try {
      await axios.post(`http://localhost:3000/users/${userId}/follow`, {}, {
        withCredentials: true,
      });
      toast({
        title: "Following",
        description: "You are now following this user back",
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Your Followers
        </h1>
        <p className="text-muted-foreground">
          People who are following you ({userData?.followers?.length || 0})
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Followers List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {followersData?.length > 0 ? (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {followersData.map((follower: any) => (
                  <div key={follower.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={follower.photo} />
                        <AvatarFallback>
                          {follower.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{follower.name}</p>
                        <p className="text-sm text-muted-foreground">{follower.location}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {follower.followers?.length || 0} followers
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {follower.friends?.length || 0} friends
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFollowBack(follower.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow Back
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddFriend(follower.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No followers yet</h3>
              <p className="text-muted-foreground">
                When people start following you, they'll appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Followers;
