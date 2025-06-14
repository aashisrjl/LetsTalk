
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
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { RoomCard } from "@/components/RoomCard";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Room {
  _id: string;
  roomId: string;
  title: string;
  language: string;
  participants: any[];
  maxParticipants: number;
  isLive?: boolean;
  topic: string;
  description?: string;
  createdBy: {
    name: string;
    _id: string;
  };
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalMessages: number;
  totalSessions: number;
  totalRooms: number;
}

export function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch featured/recent rooms
  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useQuery({
    queryKey: ['featuredRooms', refreshKey],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/rooms/featured', {
        withCredentials: true,
      });
      return response.data;
    },
  });

  // Fetch dashboard statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', refreshKey],
    queryFn: async () => {
      // Mock API call for stats - replace with real endpoints
      const roomsResponse = await axios.get('http://localhost:3000/rooms/count', {
        withCredentials: true,
      });
      
      return {
        totalUsers: 1250 + Math.floor(Math.random() * 100), // Dynamic mock data
        totalMessages: 5689 + Math.floor(Math.random() * 500),
        totalSessions: 342 + Math.floor(Math.random() * 50),
        totalRooms: roomsResponse.data.count || 0,
      };
    },
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Refreshed",
      description: "Dashboard data has been updated",
    });
  };

  const handleJoinRoom = (roomId: string) => {
    console.log('Dashboard: Navigating to room:', roomId);
    navigate(`/room/${roomId}`);
  };

  const rooms = roomsData?.rooms || [];
  const stats = statsData || {
    totalUsers: 0,
    totalMessages: 0,
    totalSessions: 0,
    totalRooms: 0,
  };

  if (roomsError) {
    console.error('Error fetching rooms:', roomsError);
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Overview of your language learning progress and community activity
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={roomsLoading || statsLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${roomsLoading || statsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
            <p className="text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-500">-5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</div>
            <p className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              Active Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Featured Rooms</h3>
          <p className="text-muted-foreground">
            Join a live session and start practicing!
          </p>
        </div>
        <Button onClick={() => navigate('/rooms')} variant="outline">
          View All Rooms
        </Button>
      </div>

      {roomsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.slice(0, 6).map((room: Room) => (
            <RoomCard
              key={room._id}
              title={room.title}
              language={room.language}
              participants={room.participants?.length || 0}
              maxParticipants={room.maxParticipants}
              isLive={room.isLive || Math.random() > 0.5}
              topic={room.topic}
              description={room.description}
              roomId={room.roomId}
              onClick={() => handleJoinRoom(room.roomId)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Be the first to create a room and start practicing!
            </p>
            <Button onClick={() => navigate('/rooms')}>
              Create Room
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-4">Analytics Overview</h3>
        <p className="text-muted-foreground mb-6">
          Track your progress and community engagement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Language Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">English</span>
                <Badge variant="secondary">45%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spanish</span>
                <Badge variant="secondary">30%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">French</span>
                <Badge variant="secondary">25%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Activity Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Peak Hours</span>
                <Badge variant="outline">2-6 PM</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Most Active Day</span>
                <Badge variant="outline">Wednesday</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Session Time</span>
                <Badge variant="outline">45 min</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
