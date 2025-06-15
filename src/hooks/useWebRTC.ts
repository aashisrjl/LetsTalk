
import { useState, useEffect, useRef, useCallback } from 'react';
import { socketManager } from '@/utils/socket';

interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export const useWebRTC = (roomId: string, userId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);

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
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('Local stream initialized:', stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((targetUserId: string) => {
    const peerConnection = new RTCPeerConnection(iceServers);
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', targetUserId);
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(targetUserId, remoteStream)));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('iceCandidate', {
            toSocketId: targetUserId,
            candidate: event.candidate,
          });
        }
      }
    };

    peerConnections.current.set(targetUserId, peerConnection);
    return peerConnection;
  }, [localStream]);

  // Create and send offer
  const createOffer = useCallback(async (targetUserId: string) => {
    const peerConnection = createPeerConnection(targetUserId);
    
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('offer', {
          toSocketId: targetUserId,
          offer,
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [createPeerConnection]);

  // Handle incoming offer
  const handleOffer = useCallback(async (fromSocketId: string, offer: RTCSessionDescriptionInit) => {
    const peerConnection = createPeerConnection(fromSocketId);
    
    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('answer', {
          toSocketId: fromSocketId,
          answer,
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [createPeerConnection]);

  // Handle incoming answer
  const handleAnswer = useCallback(async (fromSocketId: string, answer: RTCSessionDescriptionInit) => {
    const peerConnection = peerConnections.current.get(fromSocketId);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (fromSocketId: string, candidate: RTCIceCandidateInit) => {
    const peerConnection = peerConnections.current.get(fromSocketId);
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      
      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      peerConnections.current.forEach((peerConnection) => {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      setIsScreenSharing(true);
      
      // Handle screen share end
      videoTrack.onended = () => {
        setIsScreenSharing(false);
        // Switch back to camera
        if (localStream) {
          const cameraTrack = localStream.getVideoTracks()[0];
          peerConnections.current.forEach((peerConnection) => {
            const sender = peerConnection.getSenders().find(s => 
              s.track && s.track.kind === 'video'
            );
            if (sender) {
              sender.replaceTrack(cameraTrack);
            }
          });
        }
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }, [localStream]);

  // Setup socket listeners
  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    // Socket event listeners
    const handleOfferEvent = ({ fromSocketId, offer }: any) => {
      handleOffer(fromSocketId, offer);
    };

    const handleAnswerEvent = ({ fromSocketId, answer }: any) => {
      handleAnswer(fromSocketId, answer);
    };

    const handleIceCandidateEvent = ({ fromSocketId, candidate }: any) => {
      handleIceCandidate(fromSocketId, candidate);
    };

    const handleUserConnected = ({ userId: newUserId, socketId }: any) => {
      console.log('User connected, creating offer for:', newUserId);
      createOffer(socketId);
    };

    const handleUserDisconnected = ({ userId: disconnectedUserId }: any) => {
      console.log('User disconnected:', disconnectedUserId);
      const peerConnection = peerConnections.current.get(disconnectedUserId);
      if (peerConnection) {
        peerConnection.close();
        peerConnections.current.delete(disconnectedUserId);
      }
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(disconnectedUserId);
        return newMap;
      });
    };

    socket.on('offer', handleOfferEvent);
    socket.on('answer', handleAnswerEvent);
    socket.on('iceCandidate', handleIceCandidateEvent);
    socket.on('userConnected', handleUserConnected);
    socket.on('userDisconnected', handleUserDisconnected);

    return () => {
      socket.off('offer', handleOfferEvent);
      socket.off('answer', handleAnswerEvent);
      socket.off('iceCandidate', handleIceCandidateEvent);
      socket.off('userConnected', handleUserConnected);
      socket.off('userDisconnected', handleUserDisconnected);
    };
  }, [handleOffer, handleAnswer, handleIceCandidate, createOffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      peerConnections.current.forEach((peerConnection) => {
        peerConnection.close();
      });
    };
  }, [localStream]);

  return {
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    localVideoRef,
    initializeLocalStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
  };
};
