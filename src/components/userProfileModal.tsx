import { useState } from "react";
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
} from "lucide-react";
import axios from "axios";
import { toast } from '@/hooks/use-toast';

interface UserProfileModalProps {
  user: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
    bio?: string;
    location?: string;
    createdAt?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal = ({ user, isOpen, onClose }: UserProfileModalProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

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
            <Badge variant="secondary">
              {isFollowing ? "Following" : "Not Following"}
            </Badge>
            <Badge variant="outline">
              {isFriend ? "Friend" : "Not Friend"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {user.bio || "No bio available"}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="py-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <p>
              {user.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <p>
              {user.email}
            </p>
          </div>
          {user.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <p>
                {user.location}
              </p>
            </div>
          )}
          {user.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <p>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-5 w-5" />
              <p>{followersCount} Followers</p>
            </div>
            <div className="flex items-center gap-1">
              <UserCheck className="h-5 w-5" />
              <p>{friendsCount} Friends</p>
            </div>
          </div>

          <div className="flex gap-2">
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
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            ) : (
              <Button variant="outline" onClick={handleRemoveFriend} disabled={actionLoading}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Remove Friend
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
