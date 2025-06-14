
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { RoomCard } from "@/components/RoomCard"; // Ensure RoomCard is updated
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios"; // Import axios for API calls

const Rooms = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [rooms, setRooms] = useState([]); // State for rooms data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const languages = [
    "all",
    "English",
    "Spanish",
    "French",
    "Japanese",
    "German",
    "Italian",
  ];

  // Fetch public rooms from the API
  useEffect(() => {
    const fetchPublicRooms = async () => {
      try {
        const response = await axios.get("http://localhost:3000/rooms", {
          // Updated to use /rooms/public endpoint
        });
        if (response.data.success) {
          setRooms(response.data.rooms || []); // Rooms should include populated participants
        } else {
          setError("Failed to fetch rooms: No data returned.");
        }
      } catch (err) {
        setError("Failed to fetch public rooms. Please try again later.");
        console.error("Error fetching public rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicRooms();
  }, []); // Empty dependency array means it runs once on mount

  const filteredRooms = rooms.filter((room) => {
    if (!room || typeof room !== "object") return false;

    const title = room.title || "";
    const language = room.language || "";
    const description = room.description || "";
    const level = room.level || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      level.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage =
      selectedLanguage === "all" || language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="container mx-auto p-2">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="flex mt-4">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-0">
              <div className="p-4 lg:p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4">
                  <h1 className="text-3xl font-bold">Language Rooms</h1>
                  <p className="text-muted-foreground">
                    Join conversations and practice languages with speakers from
                    around the world. All rooms support video, voice, and text
                    chat.
                  </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rooms or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang === "all" ? "All Languages" : lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Stats */}
                <div className="flex gap-4 flex-wrap">
                  <Badge variant="secondary">
                    {filteredRooms.length} rooms available
                  </Badge>
                  <Badge variant="secondary">
                    {filteredRooms.filter((r) => r.isLive).length} live now
                  </Badge>
                  <Badge variant="secondary">
                    {filteredRooms.reduce(
                      (sum, r) => sum + (r.participants?.length || 0),
                      0
                    )}{" "}
                    active participants
                  </Badge>
                </div>

                {/* Loading or Error State */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading rooms...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-4"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  // Rooms Grid
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <RoomCard
                          key={room._id}
                          title={room.title}
                          description={room.description || ""}
                          level={room.level || "beginner"}
                          language={room.language || ""} // Added language prop
                          participants={room.participants?.length || 0}
                          maxParticipants={room.maxParticipants || 10}
                          isLive={room.isLive || false}
                          topic={room.topic || "General"} // Added missing topic prop
                          roomId={room.roomId}
                        />
                      ))
                    ) : (
                      <div className="flex justify-center align-center text-center ml-[30rem] mt-20">
                        <div className="text-center py-12 ">
                          <p className="text-muted-foreground">
                            No rooms found matching your criteria.
                          </p>
                          <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4"
                          >
                            Create a New Room
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>

        {/* Floating Create Room Button */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Rooms;
