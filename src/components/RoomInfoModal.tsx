
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, BarChart, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Participant {
  _id: string;
  name: string;
  photo?: string;
}

interface Room {
  title: string;
  topic?: string;
  description?: string;
  language: string;
  level?: string;
  participants: string[];
  maxParticipants: number;
  tags?: string[];
}

interface RoomInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
}

export function RoomInfoModal({ isOpen, onClose, room }: RoomInfoModalProps) {
  const [participantsDetails, setParticipantsDetails] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && room.participants && room.participants.length > 0) {
      const fetchParticipants = async () => {
        setIsLoading(true);
        setParticipantsDetails([]);
        try {
          const participantPromises = room.participants.map(userId =>
            axios.get(`http://localhost:3000/users/${userId}`, { withCredentials: true })
          );
          const responses = await Promise.all(participantPromises);
          const participantsData = responses.filter(res => res.data.success).map(res => res.data.user);
          setParticipantsDetails(participantsData);
        } catch (error) {
          console.error("Failed to fetch participant details", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchParticipants();
    } else {
      setParticipantsDetails([]);
    }
  }, [isOpen, room]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
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
            <Badge variant="secondary" className="ml-auto">{room.participants.length} / {room.maxParticipants}</Badge>
          </div>
          
          {room.participants && room.participants.length > 0 && (
            <div className="pl-9 -mt-2">
              <ScrollArea className="h-24 pr-4">
                {isLoading ? (
                  <p className="text-sm text-gray-400">Loading participants...</p>
                ) : (
                  <div className="space-y-3 pt-2">
                    {participantsDetails.map((p) => (
                      <div key={p._id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={p.photo} alt={p.name} />
                          <AvatarFallback className="bg-slate-700">{p.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white/90">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
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
                    {room.tags.map(tag => <Badge key={tag} variant="outline" className="border-blue-400 text-blue-400">{tag}</Badge>)}
                </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
