import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  LineChart,
  PieChart,
  Users,
  MessageSquare,
  Calendar,
  FileText,
} from "lucide-react";
import { RoomCard } from "@/components/RoomCard";

interface Room {
  id: number;
  title: string;
  language: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  topic: string;
}

export function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      title: "English Conversation",
      language: "English",
      participants: 5,
      maxParticipants: 10,
      isLive: true,
      topic: "Travel",
    },
    {
      id: 2,
      title: "Español para principiantes",
      language: "Spanish",
      participants: 3,
      maxParticipants: 8,
      isLive: false,
      topic: "Food",
    },
    {
      id: 3,
      title: "Learn French",
      language: "French",
      participants: 7,
      maxParticipants: 12,
      isLive: true,
      topic: "Culture",
    },
  ]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your language learning progress and community activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-muted-foreground">
              <span className="text-green-500">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,689</div>
            <p className="text-muted-foreground">
              <span className="text-red-500">-5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-muted-foreground">
              <span className="text-green-500">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-muted-foreground">
              <span className="text-green-500">+3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Live Rooms</h3>
        <p className="text-muted-foreground">
          Join a live session and start practicing!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            title={room.title}
            language={room.language}
            participants={room.participants}
            maxParticipants={room.maxParticipants}
            isLive={room.isLive}
            topic={room.topic}
          />
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold">Analytics</h3>
        <p className="text-muted-foreground">
          Track your progress and see how you're doing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart className="h-48 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
