import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import axios from "axios";

const UserProfileModal = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0); // Changed from rating to likes

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/users/${userId}`, {
          withCredentials: true}); // Ensure cookies are sent with the request
          setUser(response.data.user);
           // Use likes from the model
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
      const response = await axios.post(`http://localhost:3000/users/${userId}/likes`,{},{
        withCredentials: true // Ensure cookies are sent with the request
      }); // Updated endpoint
      if (response.data.success) {
        setLikes(response.data.user.likes); // Update with server-returned likes count
      }
    } catch (err) {
      setError("Failed to like user.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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
              </div>
            </div>
            <p className="mb-2">{user.bio || "No bio available"}</p>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 fill-yellow-400" />
              <span className="text-lg font-medium">{likes}</span>
              <span className="text-sm text-gray-500">({user.sessions || 0} likes)</span>
            </div>
            <Button variant="default" onClick={handleLikeUser} className="w-full mb-4">
              Like User
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default UserProfileModal;