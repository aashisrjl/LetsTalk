import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Globe, Play, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  title: string;
  language: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  topic: string;
  description?: string;
  level?: string;
  roomId?: string;
  onClick?: () => void;
}

export function RoomCard({
  title,
  language,
  participants,
  maxParticipants,
  isLive,
  topic,
  description,
  level,
  roomId,
  onClick,
}: RoomCardProps) {
  const navigate = useNavigate();

  const getLanguageColor = (language: string) => {
    if (!language) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    
    switch (language.toLowerCase()) {
      case "english": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "spanish": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "french": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDifficultyVariant = (difficulty: string) => {
    if (!difficulty) return "default";
    
    switch (difficulty.toLowerCase()) {
      case "beginner": return "secondary";
      case "intermediate": return "outline";
      case "advanced": return "destructive";
      default: return "default";
    }
  };

  const isRoomFull = participants >= maxParticipants;
  const participationPercentage = (participants / maxParticipants) * 100;

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
      className="bg-background shadow-md hover:shadow-lg transition-all duration-300 hover-scale cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
            {title || "Untitled Room"}
          </CardTitle>
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
              LIVE
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Badge className={`text-xs ${getLanguageColor(language)}`}>
            {language || "Unknown"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {participants}/{maxParticipants} Participants
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  participationPercentage > 80 ? 'bg-red-500' : 
                  participationPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(participationPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLive ? "Live Now" : "Scheduled"}
          </p>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-1">Topic:</p>
          <Badge variant={getDifficultyVariant(topic)}>{topic || "General"}</Badge>
        </div>
        
        {level && (
          <div>
            <p className="text-sm font-medium mb-1">Level:</p>
            <Badge variant={getDifficultyVariant(level)}>{level}</Badge>
          </div>
        )}
        
        <Button 
          variant={isLive ? "default" : "secondary"} 
          className="w-full group-hover:scale-105 transition-transform"
          disabled={isRoomFull}
          onClick={handleJoinRoom}
        >
          {isRoomFull ? (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Room Full
            </>
          ) : isLive ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Join Live
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Join Room
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
