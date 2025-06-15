
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, UserCheck, Settings, Heart, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  title: string;
  language: string;
  participants: number;
  maxParticipants: number;
  level?: string;
  roomId?: string;
  onClick?: () => void;
  thumbnailUrl?: string;
  likes?: number;
}

export function RoomCard({
  title,
  language,
  participants,
  maxParticipants,
  level,
  roomId,
  onClick,
  thumbnailUrl,
  likes,
}: RoomCardProps) {
  const navigate = useNavigate();

  const isRoomFull = participants >= maxParticipants;

  const handleJoinRoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (roomId && !isRoomFull) {
      console.log('Joining room:', roomId);
      if (onClick) {
        onClick();
      } else {
        navigate(`/room/${roomId}`);
      }
    }
  };

  const handleCardClick = () => {
    if (roomId && !isRoomFull) {
      console.log('Card clicked, joining room:', roomId);
      if (onClick) {
        onClick();
      } else {
        navigate(`/room/${roomId}`);
      }
    }
  };

  return (
    <Card 
      className="bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden group w-full cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-400" />
            <CardTitle className="text-md font-semibold text-white/90">
                {language || "Language"} {level || "Any Level"}
            </CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="text-blue-400 hover:bg-gray-800 hover:text-blue-300">
            <Settings className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 flex flex-col items-center justify-center space-y-4">
        <img src={thumbnailUrl || `https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=300&h=300&auto=format&fit=crop`} alt={title} className="w-40 h-40 rounded-full object-cover border-4 border-gray-800" />
        
        <div className="flex items-center gap-1 text-white text-sm">
            <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
            <span>{likes || 0}</span>
        </div>

        <Button 
          variant="outline"
          className="w-full border-dashed border-blue-400 text-blue-400 bg-transparent hover:bg-blue-400 hover:text-white disabled:border-gray-600 disabled:text-gray-600 disabled:bg-transparent mt-2"
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
  );
}
