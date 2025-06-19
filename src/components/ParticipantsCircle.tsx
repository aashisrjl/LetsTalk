import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Users } from 'lucide-react';
import axios from 'axios';

interface Participant {
  id: string; // Changed from _id to id to match API
  name: string;
  photo?: string;
  likes?: number;
}

interface Room {
  participants: { _id: string; name: string; photo?: string; rating?: number }[];
}

interface ParticipantsCircleProps {
  rooms: Room[];
  onUserClick: (user: Participant) => void;
}

export function ParticipantsCircle({ rooms, onUserClick }: ParticipantsCircleProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        // Get all unique participant IDs from all rooms
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

        // Fetch participant details (limit to first 10 for display)
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
            id: res.data.user.id,
            name: res.data.user.name,
            photo: res.data.user.photo,
            likes: res.data.user.stats?.likes || 0,
          }));

        setParticipants(participantsData);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (rooms.length > 0) {
      fetchParticipants();
    }
  }, [rooms]);

  // Show dummy data if no participants
  const dummyParticipants = [
    {
      id: 'dummy1',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy2',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy3',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy4',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy5',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy1',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy2',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy3',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy4',
      name: '',
      photo: '',
      likes: 0,
    },
    {
      id: 'dummy5',
      name: '',
      photo: '',
      likes: 0,
    },
  ];

  const displayParticipants = participants.length > 0 ? participants : dummyParticipants;

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span className="text-muted-foreground">Loading participants...</span>
      </div>
    );
  }

  return (
    //scroll horizontally
    <div className="space-y-4 *:overflow-x-auto "> 
      <div className="flex items-center gap-4 ">
        <Users className="h-5 w-5 text-blue-500" />
        <span className="text-sm text-muted-foreground">
          {participants.length > 0 ? 'Currently active participants' : 'Preview participants'}
        </span>
      </div>
      <div  className="flex flex-wrap gap-4">
        {displayParticipants.map((participant) => (
          <div
            key={participant.id}
            onClick={() => onUserClick(participant)}
            className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
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
    </div>
  );
}