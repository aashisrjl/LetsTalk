import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Mic, MessageSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { useState } from "react";
import UserProfileModal from "@/components/userProfileModal"; // Adjust the import path

interface RoomCardProps {
  title: string;
  description: string;
  level: string;
  language: string;
  participants: { id: string; photo?: string; likes?: number; name?: string }[];
  maxParticipants: number;
  isLive: boolean;
  roomId?: string;
}

export function RoomCard({ 
  title, 
  description, 
  level, 
  language, 
  participants = [], 
  maxParticipants, 
  isLive, 
  roomId = "test-room"
}: RoomCardProps) {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJoinRoom = () => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    } else {
      console.error("No roomId provided for navigation");
    }
  };

  // Limit participants to 3 for better layout
  const displayedParticipants = participants

  const handleParticipantClick = (participantId) => {
    setSelectedUserId(participantId);
    setIsModalOpen(true);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {language}
              </Badge>
              {isLive && (
                <Badge className="bg-red-500 hover:bg-red-600 text-xs animate-pulse">
                  LIVE
                </Badge>
              )}
              {!isLive && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Scheduled
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm mt-1 line-clamp-2">{description}</CardDescription>
            )}
            {level && (
              <CardDescription className="text-sm mt-1">
                <Badge variant={level === "beginner" ? "green" : level === "intermediate" ? "yellow" : "red"}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Badge>
              </CardDescription>
            )}
          </div>
          <div className="flex gap-1">
            <div className="p-1.5 rounded-md bg-green-100 text-green-600">
              <Video className="h-3 w-3" />
            </div>
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
              <Mic className="h-3 w-3" />
            </div>
            <div className="p-1.5 rounded-md bg-purple-100 text-purple-600">
              <MessageSquare className="h-3 w-3" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants.length}/{maxParticipants}</span>
          </div>
        </div>
        {/* Participants Section */}
        {displayedParticipants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {displayedParticipants.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleParticipantClick(participant.id)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={participant.photo || "/placeholder.svg"} 
                    alt={`${participant.name || 'Anonymous'}'s profile picture`} 
                  />
                  <AvatarFallback>
                    {participant.name ? participant.name.slice(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="text-sm">{participant.name || "Anonymous"}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    <span>{participant.likes || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            {participants.length > 3 && (
              <span className="text-sm text-muted-foreground">+{participants.length - 3} more</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant={isLive ? "default" : "outline"}
          onClick={handleJoinRoom}
          disabled={!roomId}
        >
          {isLive ? "Join Now" : "Schedule"}
        </Button>
      </CardFooter>

      <UserProfileModal 
        userId={selectedUserId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Card>
  );
}