import { useEffect, useState } from "react";
import { RoomCard } from "@/components/RoomCard";
import { UserProfile } from "@/components/UserProfile";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const trendingTopics = [
  "Business English",
  "Travel Phrases",
  "Cultural Exchange",
  "Grammar Help",
  "Pronunciation",
];

export function Dashboard() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        const response = await axios.get("http://localhost:3000/rooms/featured");
        if (response.data) {
          setFeaturedRooms(response.data.rooms);
        }
      } catch (error) {
        console.error("Failed to load featured rooms", error);
      }
    };

    fetchFeaturedRooms();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to FreeTalk</h1>
          <p className="text-xl opacity-90 mb-6">
            Connect with language learners worldwide and practice in real-time
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">2.5k+</span>
              <span className="text-sm">Active Users</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">150+</span>
              <span className="text-sm">Live Rooms</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">50+</span>
              <span className="text-sm">Languages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search rooms by language or topic..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Featured Rooms */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Rooms</h2>
              <Button onClick={()=>{navigate('/rooms')}} variant="outline">View All</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {Array.isArray(featuredRooms) && featuredRooms.length > 0 ? (
                featuredRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    title={room.title}
                    language={room.language}
                    participants={room.participants.length}
                    maxParticipants={room.maxParticipants}
                    isLive={room.isLive}
                    difficulty={room.difficulty || "Beginner"}
                    topic={room.topic}
                  />
                ))
              ) : (
                <p>No featured rooms available.</p>
              )}
            </div>
          </section>

          {/* Trending Topics */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Trending Topics</h2>
            <div className="flex flex-wrap gap-3">
              {trendingTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                >
                  #{topic.replace(" ", "")}
                </Badge>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}
