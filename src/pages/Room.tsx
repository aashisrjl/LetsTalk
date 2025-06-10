
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, MessageSquare, Users, Settings, Phone, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ name: "You", photo: null }); // Default user data

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/user", {
          withCredentials: true, // Match your auth middleware
        });
        if (response.data.success) {
          setUser({
            name: response.data.user.name || "You",
            photo: response.data.user.photo || null, // URL or null
          });
        } else {
          console.error("Failed to fetch user profile:", response.data.message);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  // Fetch room data when component mounts
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/rooms/${roomId}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setRoomData(response.data.room);
          setParticipants(response.data.room.participants || []);
          setMessages(response.data.room.messages || []);
        } else {
          setError("Failed to fetch room data.");
        }
      } catch (err) {
        setError("Error fetching room data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: user.name,
        message: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      // Optionally send to server
      // axios.post(`http://localhost:3000/rooms/${roomId}/messages`, newMessage, { withCredentials: true });
    }
  };

  const leaveRoom = () => {
    navigate("/rooms");
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!roomData) return <div className="p-4 text-center">Room not found.</div>;

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b p-2 sm:p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/rooms")}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {user.photo && (
                  <img
                    src={user.photo}
                    alt={`${user.name}'s profile`}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-semibold truncate">{roomData.title}</h1>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="text-xs">{roomData.language}</Badge>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate">{roomData.topic}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{roomData.participants?.length || 0}/{roomData.maxParticipants}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={leaveRoom} className="ml-2 flex-shrink-0">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Leave Room</span>
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-2 sm:p-4">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 min-h-[calc(100vh-120px)]">
            {/* Video Section */}
            <div className="lg:col-span-3 space-y-4 order-1 lg:order-1">
              {/* Main Video (Your Video) */}
              <Card className="h-64 sm:h-80 lg:h-2/3">
                <CardContent className="p-2 sm:p-4 h-full">
                  <div className="bg-gray-900 rounded-lg h-full flex items-center justify-center relative">
                    <div className="text-white text-center">
                      <Video className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto mb-2 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-lg">Your Video ({user.name})</p>
                      {user.photo && (
                        <img
                          src={user.photo}
                          alt={`${user.name}'s profile`}
                          className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full object-cover mx-auto mt-2"
                        />
                      )}
                      <p className="text-xs sm:text-sm opacity-75">Camera is {isVideoEnabled ? 'on' : 'off'}</p>
                    </div>
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant={isVideoEnabled ? "default" : "destructive"}
                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                        className="h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                      >
                        {isVideoEnabled ? <Video className="h-3 w-3 sm:h-4 sm:w-4" /> : <VideoOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isAudioEnabled ? "default" : "destructive"}
                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                        className="h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                      >
                        {isAudioEnabled ? <Mic className="h-3 w-3 sm:h-4 sm:w-4" /> : <MicOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participant Videos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 h-32 sm:h-40 lg:h-1/3">
                {participants.map((participant) => (
                  <Card key={participant._id || participant.id}>
                    <CardContent className="p-1 sm:p-2 h-full">
                      <div className="bg-gray-800 rounded h-full flex items-center justify-center relative">
                        <div className="text-white text-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 text-xs sm:text-sm">
                            {participant.name[0]}
                          </div>
                          <p className="text-xs sm:text-sm truncate px-1">{participant.name}</p>
                        </div>
                        <div className="absolute bottom-1 right-1 flex gap-1">
                          {participant.video ? (
                            <Video className="h-2 w-2 sm:h-3 sm:w-3 text-green-400" />
                          ) : (
                            <VideoOff className="h-2 w-2 sm:h-3 sm:w-3 text-red-400" />
                          )}
                          {participant.audio ? (
                            <Mic className="h-2 w-2 sm:h-3 sm:w-3 text-green-400" />
                          ) : (
                            <MicOff className="h-2 w-2 sm:h-3 sm:w-3 text-red-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 order-2 lg:order-2 lg:min-h-0">
              {/* Participants */}
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    Participants ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-32 sm:max-h-40 lg:max-h-none overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant._id || participant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                          {participant.name[0]}
                        </div>
                        <span className="text-xs sm:text-sm truncate">{participant.name}</span>
                        {participant.isOwner && <Badge variant="secondary" className="text-xs">Owner</Badge>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {participant.video ? (
                          <Video className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                        ) : (
                          <VideoOff className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
                        )}
                        {participant.audio ? (
                          <Mic className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                        ) : (
                          <MicOff className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Chat */}
              <Card className="flex-1 lg:min-h-0">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 h-32 sm:h-40 lg:h-60 overflow-y-auto">
                    {messages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium truncate">{msg.user}</span>
                          <span className="flex-shrink-0">{msg.time}</span>
                        </div>
                        <p className="text-xs sm:text-sm break-words">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      rows={2}
                      className="text-xs sm:text-sm"
                    />
                    <Button onClick={sendMessage} className="w-full text-xs sm:text-sm">
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Room;