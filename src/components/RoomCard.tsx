
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Video, Mic, MessageSquare, Clock } from "lucide-react";

interface RoomCardProps {
  title: string;
  language: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  type: "video" | "voice" | "text";
  difficulty?: string;
  topic?: string;
}

export function RoomCard({ 
  title, 
  language, 
  participants, 
  maxParticipants, 
  isLive, 
  type, 
  difficulty, 
  topic 
}: RoomCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "voice":
        return <Mic className="h-4 w-4" />;
      case "text":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "video":
        return "bg-green-500";
      case "voice":
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
          <div className={`p-2 rounded-lg ${getTypeColor()} text-white`}>
            {getTypeIcon()}
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
        >
          {isLive ? "Join Now" : "Schedule"}
        </Button>
      </CardFooter>
    </Card>
  );
}
