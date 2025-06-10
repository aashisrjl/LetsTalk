import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, MessageSquare, Users, Settings, Phone, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios"; // Added for API calls

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

  // Fetch room data when component mounts
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/rooms/${roomId}`, {
          withCredentials: true, // If authentication is required
        });
        if (response.data.success) {
          setRoomData(response.data.room); // Adjust based on your API response structure
          setParticipants(response.data.room.participants || []); // Adjust based on participants structure
          setMessages(response.data.room.messages || []); // Adjust if messages are part of the response
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
        user: "You", // Replace with authenticated user if available
        message: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      // Optionally, send the message to the server to update the room
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
        <div className="bg-card border-b p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/rooms")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{roomData.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{roomData.language}</Badge>
                  <span>•</span>
                  <span>{roomData.topic}</span>
                  <span>•</span>
                  <span>{roomData.participants?.length || 0}/{roomData.maxParticipants} participants</span>
                </div>
              </div>
            </div>
            <Button variant="destructive" onClick={leaveRoom}>
              <Phone className="h-4 w-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
            {/* Video Section */}
            <div className="lg:col-span-3 space-y-4">
              {/* Main Video */}
              <Card className="h-2/3">
                <CardContent className="p-4 h-full">
                  <div className="bg-gray-900 rounded-lg h-full flex items-center justify-center relative">
                    <div className="text-white text-center">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Your Video</p>
                      <p className="text-sm opacity-75">Camera is {isVideoEnabled ? 'on' : 'off'}</p>
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <Button
                        size="sm"
                        variant={isVideoEnabled ? "default" : "destructive"}
                        onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      >
                        {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isAudioEnabled ? "default" : "destructive"}
                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      >
                        {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participant Videos */}
              <div className="grid grid-cols-3 gap-4 h-1/3">
                {participants.map((participant) => (
                  <Card key={participant._id || participant.id}> {/* Use _id if from API, fallback to id */}
                    <CardContent className="p-2 h-full">
                      <div className="bg-gray-800 rounded h-full flex items-center justify-center relative">
                        <div className="text-white text-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            {participant.name[0]}
                          </div>
                          <p className="text-sm">{participant.name}</p>
                        </div>
                        <div className="absolute bottom-1 right-1 flex gap-1">
                          {participant.video ? (
                            <Video className="h-3 w-3 text-green-400" />
                          ) : (
                            <VideoOff className="h-3 w-3 text-red-400" />
                          )}
                          {participant.audio ? (
                            <Mic className="h-3 w-3 text-green-400" />
                          ) : (
                            <MicOff className="h-3 w-3 text-red-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Participants */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {participants.map((participant) => (
                    <div key={participant._id || participant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                          {participant.name[0]}
                        </div>
                        <span className="text-sm">{participant.name}</span>
                        {participant.isOwner && <Badge variant="secondary">Owner</Badge>}
                      </div>
                      <div className="flex gap-1">
                        {participant.video ? (
                          <Video className="h-3 w-3 text-green-500" />
                        ) : (
                          <VideoOff className="h-3 w-3 text-red-500" />
                        )}
                        {participant.audio ? (
                          <Mic className="h-3 w-3 text-green-500" />
                        ) : (
                          <MicOff className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Chat */}
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {messages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{msg.user}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
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
                    />
                    <Button onClick={sendMessage} className="w-full">
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