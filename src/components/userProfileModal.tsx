
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  Heart,
} from "lucide-react";
import axios from "axios";
import { toast } from '@/hooks/use-toast';

interface UserProfileModalProps {
  user: {
    _id: string;
    name: string;
    email?: string;
    photo?: string;
    bio?: string;
    location?: string;
    joinDate?: string;
    likes?: number;
    followers?: string[];
    friends?: string[];
    likedBy?: string[];
  };
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal = ({ user, currentUserId, isOpen, onClose }: UserProfileModalProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsFollowing(user.followers?.includes(currentUserId) || false);
      setIsFriend(user.friends?.includes(currentUserId) || false);
      setHasLiked(user.likedBy?.includes(currentUserId) || false);
      setFollowersCount(user.followers?.length || 0);
      setFriendsCount(user.friends?.length || 0);
      setLikesCount(user.likes || 0);
    }
  }, [user, currentUserId]);

  const handleFollow = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        `http://localhost:3000/users/${user._id}/follow`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        
        // Create notification for the followed user
        try {
          await axios.post('http://localhost:3000/notifications', {
            recipientId: user._id,
            type: 'follow',
            title: 'New Follower',
            description: `${response.data.currentUserName || 'Someone'} started following you`,
            data: { followerId: currentUserId, action: 'follow' }
          }, { withCredentials: true });
        } catch (notifError) {
          console.error('Failed to create follow notification:', notifError);
        }
        
        toast({
          title: "Success",
          description: `You are now following ${user.name}`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to follow user';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        `http://localhost:3000/users/${user._id}/unfollow`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: "Success", 
          description: `You unfollowed ${user.name}`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to unfollow user';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        `http://localhost:3000/users/${user._id}/friend`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsFriend(true);
        setFriendsCount(prev => prev + 1);
        
        // Create notification for the new friend
        try {
          await axios.post('http://localhost:3000/notifications', {
            recipientId: user._id,
            type: 'friend',
            title: 'New Friend Request',
            description: `${response.data.currentUserName || 'Someone'} added you as a friend`,
            data: { friendId: currentUserId, action: 'friend_added' }
          }, { withCredentials: true });
        } catch (notifError) {
          console.error('Failed to create friend notification:', notifError);
        }
        
        toast({
          title: "Success",
          description: `${user.name} added as friend`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add friend';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        `http://localhost:3000/users/${user._id}/unfriend`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsFriend(false);
        setFriendsCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: "Success",
          description: `${user.name} removed from friends`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to remove friend';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleLike = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        `http://localhost:3000/users/${user._id}/likes`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setLikesCount(response.data.user.likes);
        setHasLiked(true);
        
        // Create notification for the liked user
        try {
          await axios.post('http://localhost:3000/notifications', {
            recipientId: user._id,
            type: 'like',
            title: 'Someone Liked You!',
            description: `${response.data.currentUserName || 'Someone'} liked your profile`,
            data: { likerId: currentUserId, action: 'profile_liked' }
          }, { withCredentials: true });
        } catch (notifError) {
          console.error('Failed to create like notification:', notifError);
        }
        
        toast({
          title: "Success",
          description: `You liked ${user.name}!`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to like user';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.photo} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.name}
            {isFollowing && <Badge variant="secondary">Following</Badge>}
            {isFriend && <Badge variant="outline">Friend</Badge>}
          </DialogTitle>
          <DialogDescription>
            {user.bio || "No bio available"}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="py-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p>{user.name}</p>
          </div>
          {user.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p>{user.email}</p>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p>{user.location}</p>
            </div>
          )}
          {user.joinDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p>Joined {new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <Separator />
        
        <div className="py-4 flex justify-around">
            <div className="text-center">
              <p className="font-semibold text-lg">{likesCount}</p>
              <p className="text-sm text-muted-foreground">Likes</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{followersCount}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{friendsCount}</p>
              <p className="text-sm text-muted-foreground">Friends</p>
            </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
            <Button onClick={handleLike} disabled={actionLoading || hasLiked}>
              <Heart className="h-4 w-4 mr-2" />
              {hasLiked ? 'Liked' : 'Like'}
            </Button>
            {!isFollowing ? (
              <Button onClick={handleFollow} disabled={actionLoading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Follow
              </Button>
            ) : (
              <Button variant="outline" onClick={handleUnfollow} disabled={actionLoading}>
                Unfollow
              </Button>
            )}

            {!isFriend ? (
              <Button onClick={handleAddFriend} disabled={actionLoading}>
                <Users className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            ) : (
              <Button variant="outline" onClick={handleRemoveFriend} disabled={actionLoading}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Remove Friend
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
