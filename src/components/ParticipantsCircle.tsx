import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Users } from 'lucide-react';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { UserProfileModal } from './userProfileModal';

interface Participant {
  _id: string;
  name: string;
  photo?: string;
  likes?: number;
}

interface User {
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
}

interface Room {
  participants: { _id: string; name: string; photo?: string; rating?: number }[];
}

interface ParticipantsCircleProps {
  rooms: Room[];
  currentUserId: string; // Added currentUserId
}

export function ParticipantsCircle({ rooms, currentUserId }: ParticipantsCircleProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleParticipantClick = async (participantId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/users/${participantId}`, {
        withCredentials: true,
      });
      if (response.data.success && response.data.user) {
        setSelectedUser(response.data.user);
        setIsProfileModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error(`ParticipantsCircle: Failed to fetch user profile ${participantId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch user profile",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        const allParticipantIds = new Set<string>();
        rooms.forEach((room) => {
          if (room.participants && Array.isArray(room.participants)) {
            room.participants.forEach((participant) => {
              if (participant._id) {
                allParticipantIds.add(participant._id);
              }
            });
          }
        });

        const participantIds = Array.from(allParticipantIds).slice(0, 10);
        const participantPromises = participantIds.map((userId) =>
          axios
            .get(`http://localhost:3000/users/${userId}`, { withCredentials: true })
            .catch((err) => {
              console.error(`Failed to fetch user ${userId}:`, err);
              return null;
            })
        );

        const responses = await Promise.all(participantPromises);
        const participantsData = responses
          .filter((res) => res?.data?.success)
          .map((res) => ({
            _id: res.data.user._id, // Use _id consistently
            name: res.data.user.name,
            photo: res.data.user.photo,
            likes: res.data.user.likes || 0, // Adjusted to match User interface
          }));

        setParticipants(participantsData);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
        toast({
          title: "Error",
          description: "Failed to fetch participants",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (rooms.length > 0) {
      fetchParticipants();
    } else {
      setParticipants([]);
    }
  }, [rooms]);

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span className="text-muted-foreground">Loading participants...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Users className="h-5 w-5 text-blue-500" />
        <span className="text-sm text-muted-foreground">
          {participants.length > 0 ? 'Currently active participants' : 'No participants available'}
        </span>
      </div>
      {participants.length > 0 ? (
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {participants.map((participant) => (
            <div
              key={participant._id}
              onClick={() => handleParticipantClick(participant._id)}
              className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group min-w-[120px]"
            >
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-blue-400 group-hover:border-blue-500 transition-colors">
                  <AvatarImage src={participant.photo} alt={participant.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {participant.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium truncate max-w-[80px]" title={participant.name}>
                  {participant.name}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  <Heart className="w-3 h-3 mr-1 text-red-500" fill="currentColor" />
                  {participant.likes || 0}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No participants to display</p>
      )}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          currentUserId={currentUserId} // Use authenticated user's ID
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}