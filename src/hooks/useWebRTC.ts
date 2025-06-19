import { useState, useEffect, useRef, useCallback } from 'react';
import { socketManager } from '@/utils/socket';

interface RemoteStream {
  userId: string;
  stream: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export const useWebRTC = (roomId: string, userId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      console.log('Local stream initialized:', stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow microphone and camera access.');
      throw error;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(
    (targetUserId: string) => {
      const peerConnection = new RTCPeerConnection(iceServers);

      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream from:', targetUserId);
        const [remoteStream] = event.streams;
        setRemoteStreams((prev) => {
          const exists = prev.find((rs) => rs.userId === targetUserId);
          if (exists) {
            return prev.map((rs) =>
              rs.userId === targetUserId
                ? { ...rs, stream: remoteStream }
                : rs
            );
          }
          return [
            ...prev,
            {
              userId: targetUserId,
              stream: remoteStream,
              isAudioEnabled: true,
              isVideoEnabled: true,
            },
          ];
        });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = socketManager.getSocket();
          if (socket) {
            socket.emit('iceCandidate', {
              toUserId: targetUserId, // Use userId, not socketId
              candidate: event.candidate,
              roomId,
            });
          }
        }
      };

      peerConnections.current.set(targetUserId, peerConnection);
      return peerConnection;
    },
    [localStream, roomId]
  );

  // Create and send offer
  const createOffer = useCallback(
    async (targetUserId: string) => {
      const peerConnection = createPeerConnection(targetUserId);
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('offer', {
            toUserId: targetUserId,
            offer,
            roomId,
          });
        }
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    },
    [createPeerConnection, roomId]
  );

  // Handle incoming offer
  const handleOffer = useCallback(
    async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
      const peerConnection = createPeerConnection(fromUserId);
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('answer', {
            toUserId: fromUserId,
            answer,
            roomId,
          });
        }
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },
    [createPeerConnection, roomId]
  );

  // Handle incoming answer
  const handleAnswer = useCallback(
    async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
      const peerConnection = peerConnections.current.get(fromUserId);
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    },
    []
  );

  // Handle ICE candidate
  const handleIceCandidate = useCallback(
    async (fromUserId: string, candidate: RTCIceCandidateInit) => {
      const peerConnection = peerConnections.current.get(fromUserId);
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    },
    []
  );

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const newState = !videoTrack.enabled;
        videoTrack.enabled = newState;
        setIsVideoEnabled(newState);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('mediaStateChange', {
            roomId,
            userId,
            mediaType: 'video',
            isEnabled: newState,
          });
        }
      }
    }
  }, [localStream, roomId, userId]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const newState = !audioTrack.enabled;
        audioTrack.enabled = newState;
        setIsAudioEnabled(newState);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('mediaStateChange', {
            roomId,
            userId,
            mediaType: 'audio',
            isEnabled: newState,
          });
        }
      }
    }
  }, [localStream, roomId, userId]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const videoTrack = screenStream.getVideoTracks()[0];
      if (localStreamRef.current) {
        const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (currentVideoTrack) {
          currentVideoTrack.stop();
          localStreamRef.current.removeTrack(currentVideoTrack);
        }
        localStreamRef.current.addTrack(videoTrack);
        setLocalStream(new MediaStream([...localStreamRef.current.getTracks()]));
      }
      peerConnections.current.forEach((peerConnection) => {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
      setIsScreenSharing(true);
      videoTrack.onended = () => {
        setIsScreenSharing(false);
        initializeLocalStream(); // Reinitialize camera
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      alert('Failed to start screen sharing.');
    }
  }, [initializeLocalStream]);

  // Setup socket listeners
  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    socket.emit('joinRoom', { roomId, userId });

    const handleOfferEvent = ({ fromUserId, offer }: any) => {
      handleOffer(fromUserId, offer);
    };
    const handleAnswerEvent = ({ fromUserId, answer }: any) => {
      handleAnswer(fromUserId, answer);
    };
    const handleIceCandidateEvent = ({ fromUserId, candidate }: any) => {
      handleIceCandidate(fromUserId, candidate);
    };
    const handleUserConnected = ({ userId: newUserId }: any) => {
      if (newUserId !== userId) {
        console.log('User connected, creating offer for:', newUserId);
        createOffer(newUserId);
      }
    };
    const handleUserDisconnected = ({ userId: disconnectedUserId }: any) => {
      console.log('User disconnected:', disconnectedUserId);
      const peerConnection = peerConnections.current.get(disconnectedUserId);
      if (peerConnection) {
        peerConnection.close();
        peerConnections.current.delete(disconnectedUserId);
      }
      setRemoteStreams((prev) =>
        prev.filter((rs) => rs.userId !== disconnectedUserId)
      );
    };
    const handleMediaStateChange = ({
      userId: remoteUserId,
      mediaType,
      isEnabled,
    }: any) => {
      setRemoteStreams((prev) =>
        prev.map((rs) =>
          rs.userId === remoteUserId
            ? {
                ...rs,
                [mediaType === 'audio' ? 'isAudioEnabled' : 'isVideoEnabled']:
                  isEnabled,
              }
            : rs
        )
      );
    };

    socket.on('offer', handleOfferEvent);
    socket.on('answer', handleAnswerEvent);
    socket.on('iceCandidate', handleIceCandidateEvent);
    socket.on('userConnected', handleUserConnected);
    socket.on('userDisconnected', handleUserDisconnected);
    socket.on('mediaStateChange', handleMediaStateChange);

    // Initialize stream on mount
    initializeLocalStream();

    return () => {
      socket.off('offer', handleOfferEvent);
      socket.off('answer', handleAnswerEvent);
      socket.off('iceCandidate', handleIceCandidateEvent);
      socket.off('userConnected', handleUserConnected);
      socket.off('userDisconnected', handleUserDisconnected);
      socket.off('mediaStateChange', handleMediaStateChange);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
    };
  }, [
    roomId,
    userId,
    initializeLocalStream,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    createOffer,
  ]);

  return {
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    toggleVideo,
    toggleAudio,
    startScreenShare,
  };
};