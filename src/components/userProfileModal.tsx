
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, UserPlus, UserMinus, Heart, Users } from "lucide-react";
import axios from "axios";

const UserProfileModal = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/users/${userId}`, {
            withCredentials: true
          });
          setUser(response.data.user);
          setLikes(response.data.user.likes || 0);
          
          // Check if current user is following or friends with this user
          // This would require additional API calls to check relationships
          // For now, we'll assume they're not following/friends initially
          setIsFollowing(false);
          setIsFriend(false);
        } catch (err) {
          setError("Failed to fetch user profile.");
        } finally {
          setLoading(false);
        }
      };
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const handleLikeUser = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(`http://localhost:3000/users/${userId}/likes`, {}, {
        withCredentials: true
      });
      if (response.data.success) {
        setLikes(response.data.user.likes);
      }
    } catch (err) {
      setError("Failed to like user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setActionLoading(true);
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await axios.post(`http://localhost:3000/users/${userId}/${endpoint}`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      setError(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFriendToggle = async () => {
    try {
      setActionLoading(true);
      const endpoint = isFriend ? 'unfriend' : 'friend';
      const response = await axios.post(`http://localhost:3000/users/${userId}/${endpoint}`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setIsFriend(!isFriend);
      }
    } catch (err) {
      setError(`Failed to ${isFriend ? 'remove' : 'add'} friend.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : user ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photo || "/placeholder.svg"} alt={`${user.name}'s profile picture`} />
                <AvatarFallback>{user.name ? user.name.slice(0, 2).toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-500">Joined: {new Date(user.joinDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">{user.location || "Location not specified"}</p>
              </div>
            </div>

            <p className="mb-4 text-sm">{user.bio || "No bio available"}</p>

            {/* Social Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{user.followers?.length || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <UserPlus className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">{user.following?.length || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">{user.friends?.length || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Friends</p>
              </div>
            </div>

            {/* Languages */}
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-sm">Native Languages</h4>
              <div className="flex flex-wrap gap-1 mb-3">
                {user.nativeLanguages?.map((lang, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded text-xs">
                    {lang.name}
                  </span>
                )) || <span className="text-xs text-gray-500">No native languages specified</span>}
              </div>
              
              <h4 className="font-medium mb-2 text-sm">Learning Languages</h4>
              <div className="flex flex-wrap gap-1">
                {user.learningLanguages?.map((lang, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs">
                    {lang.name}
                  </span>
                )) || <span className="text-xs text-gray-500">No learning languages specified</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{likes} likes</span>
              <span className="text-sm text-gray-500">• {user.sessions || 0} sessions</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={isFollowing ? "outline" : "default"} 
                  onClick={handleFollowToggle}
                  disabled={actionLoading}
                  className="w-full"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-1" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
                
                <Button 
                  variant={isFriend ? "outline" : "secondary"} 
                  onClick={handleFriendToggle}
                  disabled={actionLoading}
                  className="w-full"
                >
                  {isFriend ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-1" />
                      Unfriend
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-1" />
                      Add Friend
                    </>
                  )}
                </Button>
              </div>
              
              <Button 
                variant="default" 
                onClick={handleLikeUser} 
                disabled={actionLoading}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-1" />
                Like User
              </Button>
              
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default UserProfileModal;
