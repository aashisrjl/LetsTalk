
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, BarChart, Hash } from "lucide-react";

interface Room {
  title: string;
  topic?: string;
  description?: string;
  language: string;
  level?: string;
  participants: number;
  maxParticipants: number;
  tags?: string[];
}

interface RoomInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
}

export function RoomInfoModal({ isOpen, onClose, room }: RoomInfoModalProps) {
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
            <Badge variant="secondary" className="ml-auto">{room.participants} / {room.maxParticipants}</Badge>
          </div>
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
