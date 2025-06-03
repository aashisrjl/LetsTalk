import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RoomCard } from "@/components/RoomCard";
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

const Rooms = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const rooms = [
    {
      id: 1,
      title: "English Conversation Practice",
      language: "English",
      participants: 12,
      maxParticipants: 20,
      isLive: true,
      type: "voice" as const,
      difficulty: "Intermediate",
      topic: "Daily Life"
    },
    {
      id: 2,
      title: "Spanish Grammar Workshop",
      language: "Spanish",
      participants: 8,
      maxParticipants: 15,
      isLive: true,
      type: "video" as const,
      difficulty: "Beginner",
      topic: "Grammar"
    },
    {
      id: 3,
      title: "French Culture Discussion",
      language: "French",
      participants: 5,
      maxParticipants: 10,
      isLive: false,
      type: "text" as const,
      difficulty: "Advanced",
      topic: "Culture"
    },
    {
      id: 4,
      title: "Japanese Pronunciation",
      language: "Japanese",
      participants: 15,
      maxParticipants: 25,
      isLive: true,
      type: "voice" as const,
      difficulty: "Beginner",
      topic: "Pronunciation"
    }
  ];

  const languages = ["all", "English", "Spanish", "French", "Japanese", "German", "Italian"];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === "all" || room.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page Header */}
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">Language Rooms</h1>
                <p className="text-muted-foreground">
                  Join conversations and practice languages with speakers from around the world
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
                
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
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
                <Badge variant="secondary">{filteredRooms.length} rooms available</Badge>
                <Badge variant="secondary">
                  {filteredRooms.filter(r => r.isLive).length} live now
                </Badge>
                <Badge variant="secondary">
                  {filteredRooms.reduce((sum, r) => sum + r.participants, 0)} active participants
                </Badge>
              </div>

              {/* Rooms Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    title={room.title}
                    language={room.language}
                    participants={room.participants}
                    maxParticipants={room.maxParticipants}
                    isLive={room.isLive}
                    type={room.type}
                    difficulty={room.difficulty}
                    topic={room.topic}
                  />
                ))}
              </div>

              {filteredRooms.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No rooms found matching your criteria.</p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4"
                  >
                    Create a New Room
                  </Button>
                </div>
              )}
            </div>
          </main>
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
      </div>
    </ThemeProvider>
  );
};

export default Rooms;
