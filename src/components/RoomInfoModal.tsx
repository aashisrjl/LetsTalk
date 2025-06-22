import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, BarChart, Hash, User } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { UserProfileModal } from "./userProfileModal";

interface Participant {
  id: string;
  name: string;
  photo?: string;
}

interface RoomParticipant {
  _id: string;
  name: string;
  photo?: string;
  rating?: number;
}

interface Room {
  title: string;
  topic?: string;
  description?: string;
  language: string;
  level?: string;
  participants: (string | RoomParticipant)[];
  maxParticipants: number;
  tags?: string[];
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

interface RoomInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
}

export function RoomInfoModal({ isOpen, onClose, room }: RoomInfoModalProps) {
  const { toast } = useToast();
  const [participantsDetails, setParticipantsDetails] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('RoomInfoModal: Received room:', room);
      console.log('RoomInfoModal: Raw room.participants:', room.participants, 'Type:', Array.isArray(room.participants) ? 'Array' : typeof room.participants);

      if (room.participants && Array.isArray(room.participants) && room.participants.length > 0) {
        const fetchParticipants = async () => {
          setIsLoading(true);
          setError(null);
          setParticipantsDetails([]);

          try {
            // Process participants
            const validParticipants = room.participants
              .map((participant, index) => {
                console.log(`RoomInfoModal: Processing participant[${index}]:`, participant);
                if (typeof participant === 'string') {
                  console.log(`RoomInfoModal: Participant[${index}] is string ID: ${participant}`);
                  return { id: participant, needsFetch: true };
                } else if (typeof participant === 'object' && participant !== null && '_id' in participant && participant._id) {
                  console.log(`RoomInfoModal: Participant[${index}] is object with _id: ${participant._id}`);
                  return {
                    id: participant._id,
                    name: (participant as RoomParticipant).name,
                    photo: (participant as RoomParticipant).photo,
                    needsFetch: false,
                  };
                }
                console.warn(`RoomInfoModal: Invalid participant[${index}]:`, participant);
                return null;
              })
              .filter((p): p is { id: string; name?: string; photo?: string } => {
                const isValid = p !== null;
                console.log(`RoomInfoModal: Filter participant:`, p, 'Valid:', isValid);
                return isValid;
              });

            console.log('RoomInfoModal: Valid participant entries:', validParticipants);

            if (validParticipants.length === 0) {
              setError("No valid participants available");
              return;
            }

            // Fetch data only for string IDs
            const participantsToFetch = validParticipants.filter(p => p.needsFetch);
            let fetchedParticipants: Participant[] = [];

            if (participantsToFetch.length > 0) {
              const participantPromises = participantsToFetch.map(({ id }) => {
                const url = `http://localhost:3000/users/${id}`;
                console.log(`RoomInfoModal: Fetching user URL: ${url}`);
                return axios
                  .get(url, { withCredentials: true })
                  .catch(err => {
                    console.error(`RoomInfoModal: Failed to fetch user ${id}:`, {
                      url,
                      status: err.response?.status,
                      data: err.response?.data,
                      message: err.message,
                    });
                    return { data: { success: false } };
                  });
              });
              const responses = await Promise.all(participantPromises);
              fetchedParticipants = responses
                .filter(res => res.data.success && res.data.user)
                .map(res => ({
                  id: res.data.user.id,
                  name: res.data.user.name,
                  photo: res.data.user.photo,
                }));
            }

            // Combine fetched and pre-populated participants
            const allParticipants = [
              ...validParticipants
                .filter(p => !p.needsFetch)
                .map(p => ({ id: p.id, name: p.name!, photo: p.photo })),
              ...fetchedParticipants,
            ];

            console.log('RoomInfoModal: All participants:', allParticipants);

            if (allParticipants.length === 0 && validParticipants.length > 0) {
              setError("Failed to fetch participant details");
            } else {
              setParticipantsDetails(allParticipants);
            }
          } catch (error: any) {
            console.error("RoomInfoModal: Failed to fetch participant details:", {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data,
            });
            setError(error.response?.data?.message || "Failed to fetch participant details");
          } finally {
            setIsLoading(false);
          }
        };

        fetchParticipants();
      } else {
        setParticipantsDetails([]);
        setError("No participants in the room");
      }
    }
  }, [isOpen, room, toast]);
   const handleParticipantClick = async (participantId: string) => {
    try {
      setIsLoading(true);
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
      console.error(`RoomInfoModal: Failed to fetch user profile ${participantId}:`, {
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [error, toast]);

  if (!isOpen) return null;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">{room.topic || room.title}</DialogTitle>
          {room.description && (
            <DialogDescription className="text-gray-400 pt-2">
              {room.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-white/90">Participants</span>
            <Badge variant="secondary" className="ml-auto">
              {room.participants?.length || 0} / {room.maxParticipants}
            </Badge>
          </div>

          {room.participants && Array.isArray(room.participants) && room.participants.length > 0 ? (
            <div className="pl-9 -mt-2">
              <ScrollArea className="h-24 pr-4">
                {isLoading ? (
                  <p className="text-sm text-gray-400">Loading participants...</p>
                ) : error ? (
                  <p className="text-sm text-red-400">{error}</p>
                ) : participantsDetails.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {participantsDetails.map((p) => (
                      <div key={p.id} className="flex items-center gap-3"
                     onClick={() => handleParticipantClick(p.id)}
                       > 
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={p.photo} alt={p.name} />
                          <AvatarFallback className="bg-slate-700">
                            {p.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white/90">{p.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No participant details available</p>
                )}
              </ScrollArea>
            </div>
          ) : (
            <p className="pl-9 text-sm text-gray-400">No participants in the room</p>
          )}

          <div className="flex items-center gap-4">
            <Globe className="h-5 w-5 text-blue-400" />
            <span className="text-white/90">Language</span>
            <Badge variant="secondary" className="ml-auto">{room.language}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <BarChart className="h-5 w-5 text-blue-400" />
            <span className="text-white/90">Level</span>
            <Badge variant="secondary" className="ml-auto">{room.level || "Any"}</Badge>
          </div>
          {room.tags && room.tags.length > 0 && (
            <div className="flex items-start gap-4">
              <Hash className="h-5 w-5 text-blue-400 mt-1" />
              <span className="text-white/90 mt-1">Tags</span>
              <div className="ml-auto flex flex-wrap gap-2 justify-end">
                {room.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="border-blue-400 text-blue-400">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          currentUserId={selectedUser?._id || ""} 
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
      </>
  );
}