
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, UserCheck, Settings, Users, Phone } from "lucide-react";
import { RoomInfoModal } from "./RoomInfoModal";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Room {
  _id: string;
  roomId: string;
  title: string;
  topic?: string;
  description?: string;
  language: string;
  level?: string;
  participants: string[];
  maxParticipants: number;
  tags?: string[];
  thumbnailUrl?: string;
  currentUserId?: string; // Optional, for authenticated user
  createdBy?: string; // Optional, for room creator ID
}

interface RoomCardProps {
  room: Room;
  currentUserId: string; // Added currentUserId
  isOpen?: boolean; // Optional prop for modal
  onClose?: () => void; // Optional prop for modal close handler
  createdBy?: string; // Optional prop for room creator ID
}

export function RoomCard({ room }: RoomCardProps) {
  const {
    title,
    language,
    participants,
    maxParticipants,
    level,
    roomId,
    thumbnailUrl,
    topic,
    description,
  } = room;

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const navigate = useNavigate();

  const isRoomFull = (participants?.length || 0) >= maxParticipants;

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInfoModalOpen(true);
  };

  const handleJoinRoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (roomId && !isRoomFull) {
      navigate(`/room/${roomId}`);
    }
  };

  const handleCardClick = () => {
    if (roomId && !isRoomFull) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <>
      <Card
        className="bg-card border-border text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden group w-full cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-md font-semibold">
              {language || "Language"} | {level || "Any Level"}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-500 hover:bg-muted hover:text-blue-600"
            onClick={handleSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 flex flex-col items-center justify-center space-y-4">
          <img
            src={thumbnailUrl || `https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=300&h=300&auto=format&fit=crop`}
            alt={title}
            className="w-40 h-40 rounded-full object-cover border-4 border-border"
          />

          <div className="text-center min-h-[4rem]">
            <h3 className="font-bold text-lg text-foreground truncate" title={topic || title}>
              {topic || title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-[250px] truncate" title={description}>
                {description}
              </p>
            )}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-white text-sm bg-gradient-to-r from-blue-500 to-purple-500 rounded-full px-3 py-1 shadow-md">
                  <Users className="w-5 h-5 text-white" />
                  <span className="font-semibold">{participants?.length || 0}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{participants?.length || 0} participant{participants?.length !== 1 ? "s" : ""}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            className="w-full border-dashed border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white disabled:border-muted-foreground disabled:text-muted-foreground disabled:bg-transparent mt-2"
            disabled={isRoomFull}
            onClick={handleJoinRoom}
          >
            {isRoomFull ? (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Room Full
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Join and talk now!
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      <RoomInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        room={room}
        currentUserId={ room.createdBy} // Pass currentUserId
      />
    </>
  );
}
