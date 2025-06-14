import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Globe } from "lucide-react";

interface RoomCardProps {
  title: string;
  language: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  topic: string;
}

export function RoomCard({
  title,
  language,
  participants,
  maxParticipants,
  isLive,
  topic,
}: RoomCardProps) {
  const getLanguageColor = (language: string) => {
    switch (language) {
      case "english": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "spanish": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "french": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "secondary";
      case "intermediate": return "outline";
      case "advanced": return "destructive";
      default: return "default";
    }
  };

  return (
    <Card className="bg-background shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Badge className={`text-xs ${getLanguageColor(language)}`}>{language}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {participants}/{maxParticipants} Participants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLive ? "Live" : "Scheduled"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Topic:</p>
          <Badge variant={getDifficultyVariant(topic)}>{topic}</Badge>
        </div>
        <Button variant="secondary" className="w-full">Join Room</Button>
      </CardContent>
    </Card>
  );
}
