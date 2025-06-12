import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, MessageSquare, Users, Phone, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { io } from "socket.io-client";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ _id: null, name: "You", photo: null });
  const socket = useRef(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({}); // Typed ref for remote videos
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({}); // Typed ref for peer connections
  const localStream = useRef<MediaStream | null>(null); // Store local stream
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Basic STUN server
  };

  useEffect(() => {
    socket.current = io("http://localhost:3000", { withCredentials: true });

    socket.current.on("connect", () => {
      console.log("Connected to Socket.IO:", socket.current.id);
    });

    socket.current.on("disconnect", () => {
      console.log("Disconnected from Socket.IO");
    });

    socket.current.on("roomUsers", ({ users, ownerId: newOwnerId }) => {
      const uniqueParticipants = users.reduce((acc, curr) => {
        if (!acc.some(p => p._id === curr.userId)) {
          acc.push({ _id: curr.userId, name: curr.userName, photo: curr.photo || null });
        }
        return acc;
      }, []);
      setParticipants(uniqueParticipants);
      setOwnerId(newOwnerId);
      console.log("Updated participants:", uniqueParticipants, "Owner:", newOwnerId);
    });

    socket.current.on("userJoined", ({ userId, userName, photo, socketId }) => {
      setParticipants(prev => {
        if (!prev.some(p => p._id === userId)) {
          return [...prev, { _id: userId, name: userName, photo: photo || null }];
        }
        return prev;
      });
      createPeerConnection(socketId, userId);
    });

    socket.current.on("userDisconnected", ({ userId }) => {
      setParticipants(prev => prev.filter(p => p._id !== userId)); // Update participants on disconnect
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
        delete remoteVideoRefs.current[userId];
      }
    });

    socket.current.on("receiveMessage", ({ message, userName, time }) => {
      console.log("Received message:", { message, userName, time }); // Debug log
      // Only add message if it wasn't sent by the current user
      if (userName !== user.name) {
        setMessages(prev => [...prev, { id: Date.now(), user: userName, message, time }]);
      }
    });

    socket.current.on("offer", ({ fromSocketId, offer }) => {
      createPeerConnectionFromOffer(fromSocketId, offer);
    });

    socket.current.on("answer", ({ fromSocketId, answer }) => {
      if (peerConnections.current[fromSocketId]) {
        peerConnections.current[fromSocketId].setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.current.on("iceCandidate", ({ fromSocketId, candidate }) => {
      if (peerConnections.current[fromSocketId]) {
        peerConnections.current[fromSocketId].addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      if (socket.current) {
        socket.current.emit("leaveRoom", { roomId, userId: user._id });
        Object.values(peerConnections.current).forEach(pc => pc.close());
        if (localStream.current) {
          localStream.current.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/user", {
          withCredentials: true,
        });
        if (response.data.success) {
          setUser({
            _id: response.data.user.id,
            name: response.data.user.name || "You",
            photo: response.data.user.photo || null,
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

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/rooms/${roomId}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setRoomData(response.data.room);
          const initialParticipants = await Promise.all(
            (response.data.room.participants || []).map(async (pId) => {
              const userResponse = await axios.get(`http://localhost:3000/users/${pId}`, {
                withCredentials: true,
              });
              return {
                _id: userResponse.data.user.id,
                name: userResponse.data.user.name || "Unknown",
                photo: userResponse.data.user.photo || null,
              };
            })
          );
          setParticipants(initialParticipants);
          setOwnerId(response.data.room.createdBy);
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

    if (roomId && user._id) {
      fetchRoomData();
      socket.current.emit("joinRoom", { roomId, userId: user._id, userName: user.name });
      startLocalStream();
    }
  }, [roomId, user._id]);

  const startLocalStream = async () => {
  if (!isVideoEnabled && !isAudioEnabled) {
    setError("Please enable either camera or microphone.");
    // return;  -----------------------------------------------------
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideoEnabled,
      audio: isAudioEnabled,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localStream.current = stream;

      Object.values(peerConnections.current).forEach(pc => {
        stream.getTracks().forEach(track => {
          if (!pc.getSenders().some(sender => sender.track === track)) {
            pc.addTrack(track, stream);
          }
        });
      });
    }
  } catch (err) {
    console.error("Error accessing media devices:", err);
    setError("Please allow camera and microphone access in your browser settings.");
  }
};


  const createPeerConnection = (socketId, userId) => {
    const pc = new RTCPeerConnection(configuration);
    peerConnections.current[userId] = pc;

    const remoteVideo = document.createElement("video");
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideoRefs.current[userId] = remoteVideo;

    pc.ontrack = (event) => {
      console.log("Received remote track:", userId); // Debug log
      if (remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId].srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("iceCandidate", { toSocketId: socketId, candidate: event.candidate });
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        if (!pc.getSenders().some(sender => sender.track === track)) {
          pc.addTrack(track, localStream.current);
        }
      });
    }

    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        socket.current.emit("offer", { toSocketId: socketId, offer: pc.localDescription });
      })
      .catch(err => console.error("Error creating offer:", err));
  };

  const createPeerConnectionFromOffer = (fromSocketId, offer) => {
    const pc = new RTCPeerConnection(configuration);
    peerConnections.current[fromSocketId] = pc;

    const remoteVideo = document.createElement("video");
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideoRefs.current[fromSocketId] = remoteVideo;

    pc.ontrack = (event) => {
      console.log("Received remote track:", fromSocketId); // Debug log
      if (remoteVideoRefs.current[fromSocketId]) {
        remoteVideoRefs.current[fromSocketId].srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("iceCandidate", { toSocketId: fromSocketId, candidate: event.candidate });
      }
    };

    pc.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => {
        if (localStream.current) {
          localStream.current.getTracks().forEach(track => {
            if (!pc.getSenders().some(sender => sender.track === track)) {
              pc.addTrack(track, localStream.current);
            }
          });
        }
        return pc.createAnswer();
      })
      .then(answer => pc.setLocalDescription(answer))
      .then(() => {
        socket.current.emit("answer", { toSocketId: fromSocketId, answer: pc.localDescription });
      })
      .catch(err => console.error("Error handling offer:", err));
  };

const toggleVideo = () => {
  const enabled = !isVideoEnabled;
  setIsVideoEnabled(enabled);
  if (localStream.current) {
    localStream.current.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};


const toggleAudio = () => {
  const enabled = !isAudioEnabled;
  setIsAudioEnabled(enabled);
  if (localStream.current) {
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};


  const sendMessage = () => {
    if (message.trim() && socket.current) {
      const time = new Date().toLocaleTimeString();
      const newMessage = { id: Date.now(), user: user.name, message, time };
      socket.current.emit("sendMessage", { message, userName: user.name, time });
      setMessages(prev => [...prev, newMessage]); // Add only locally sent message
      setMessage("");
    }
  };

  const leaveRoom = () => {
    if (socket.current) {
      socket.current.emit("leaveRoom", { roomId, userId: user._id });
      Object.values(peerConnections.current).forEach(pc => pc.close());
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    }
    navigate("/rooms");
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!roomData) return <div className="p-4 text-center">Room not found.</div>;

  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b p-2 sm:p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={leaveRoom} className="flex-shrink-0">
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
                    <span className="whitespace-nowrap">{participants.length}/{roomData.maxParticipants}</span>
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
            <div className="lg:col-span-3 space-y-4 order-1 lg:order-1">
              <Card className="h-64 sm:h-80 lg:h-2/3">
                <CardContent className="p-2 sm:p-4 h-full">
                  <div className="bg-gray-900 rounded-lg h-full flex items-center justify-center relative">
                    <video ref={localVideoRef} className="w-full h-full object-cover rounded-lg" autoPlay playsInline muted />
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant={isVideoEnabled ? "default" : "destructive"}
                        onClick={toggleVideo}
                        className="h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                      >
                        {isVideoEnabled ? <Video className="h-3 w-3 sm:h-4 sm:w-4" /> : <VideoOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isAudioEnabled ? "default" : "destructive"}
                        onClick={toggleAudio}
                        className="h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                      >
                        {isAudioEnabled ? <Mic className="h-3 w-3 sm:h-4 sm:w-4" /> : <MicOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 h-32 sm:h-40 lg:h-1/3">
                {participants
                  .filter(p => p._id !== user._id)
                  .map((participant) => (
                    <Card key={participant._id}>
                      <CardContent className="p-1 sm:p-2 h-full">
                        <div className="bg-gray-800 rounded h-full flex items-center justify-center relative">
                          <video ref={el => (remoteVideoRefs.current[participant._id] = el)} className="w-full h-full object-cover rounded-lg" autoPlay playsInline muted />
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

            <div className="space-y-4 order-2 lg:order-2 lg:min-h-0">
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    Participants ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-32 sm:max-h-40 lg:max-h-none overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                          {participant.name[0]}
                        </div>
                        <span className="text-xs sm:text-sm truncate">{participant.name}</span>
                        {participant._id === ownerId && <Badge variant="secondary" className="text-xs">Owner</Badge>}
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