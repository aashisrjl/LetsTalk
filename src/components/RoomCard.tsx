import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Mic, MessageSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  title: string;
  language: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  difficulty?: string;
  topic?: string;
  roomId?: string;
}

export function RoomCard({ 
  title, 
  language, 
  participants, 
  maxParticipants, 
  isLive, 
  difficulty, 
  topic,
  roomId = "test-room" // Default roomId as fallback
}: RoomCardProps) {
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    } else {
      console.error("No roomId provided for navigation");
    }
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
        {(difficulty || topic) && (
          <CardDescription className="text-sm">
            {difficulty && `${difficulty} • `}{topic}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants}/{maxParticipants}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant={isLive ? "default" : "outline"}
          onClick={handleJoinRoom}
          disabled={!roomId} // Disable button if no roomId
        >
          {isLive ? "Join Now" : "Schedule"}
        </Button>
      </CardFooter>
    </Card>
  );
}