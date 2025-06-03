
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Video, Mic, MessageSquare, Clock } from "lucide-react";

interface Room {
  id: number;
  title: string;
  language: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  type: "video" | "audio" | "text";
  description: string;
  host: string;
  tags: string[];
}

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const getTypeIcon = () => {
    switch (room.type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "text":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (room.type) {
      case "video":
        return "bg-green-500";
      case "audio":
        return "bg-blue-500";
      case "text":
        return "bg-purple-500";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {room.language}
              </Badge>
              {room.isLive && (
                <Badge className="bg-red-500 hover:bg-red-600 text-xs animate-pulse">
                  LIVE
                </Badge>
              )}
              {!room.isLive && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Scheduled
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">{room.title}</CardTitle>
          </div>
          <div className={`p-2 rounded-lg ${getTypeColor()} text-white`}>
            {getTypeIcon()}
          </div>
        </div>
        <CardDescription className="text-sm">
          {room.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{room.participants}/{room.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg" alt={room.host} />
              <AvatarFallback className="text-xs">
                {room.host.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{room.host}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {room.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant={room.isLive ? "default" : "outline"}
        >
          {room.isLive ? "Join Now" : "Schedule"}
        </Button>
      </CardFooter>
    </Card>
  );
}
