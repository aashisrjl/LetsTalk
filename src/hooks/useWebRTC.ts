import { useState, useEffect, useRef, useCallback } from 'react';
import { socketManager } from '@/utils/socket';

interface RemoteStream {
  userId: string;
  stream: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export const useWebRTC = (roomId: string, userId: string, isConnected: boolean) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const isInitialized = useRef(false);
  const cleanupListeners = useRef<(() => void)[]>([]);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const initializeLocalStream = useCallback(async (options: { video: boolean; audio: boolean } = { video: false, audio: false }) => {
    if (!options.video && !options.audio) {
      // Create an empty MediaStream to avoid getUserMedia errors
      const stream = new MediaStream();
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsAudioEnabled(false);
      setIsVideoEnabled(false);
      setStreamError(null);
      console.log('useWebRTC: Initialized empty local stream');
      return stream;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(options);
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsAudioEnabled(stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled);
      setIsVideoEnabled(stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled);
      setStreamError(null);
      console.log('useWebRTC: Local stream initialized:', stream.id, 'Tracks:', {
        video: stream.getVideoTracks(),
        audio: stream.getAudioTracks(),
      });
      // Update peer connections with new stream
      peerConnections.current.forEach((peerConnection, targetUserId) => {
        stream.getTracks().forEach((track) => {
          const sender = peerConnection.getSenders().find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track).catch((error) => console.error(`useWebRTC: Error replacing track for ${targetUserId}:`, error));
          } else {
            peerConnection.addTrack(track, stream);
          }
        });
        // Trigger renegotiation
        createOffer(targetUserId);
      });
      return stream;
    } catch (error: any) {
      console.error('useWebRTC: Error accessing media devices:', error);
      setStreamError(error.message || 'Failed to access media devices');
      setIsAudioEnabled(false);
      setIsVideoEnabled(false);
      return null;
    }
  }, []);

  const createPeerConnection = useCallback(
    (targetUserId: string) => {
      if (peerConnections.current.has(targetUserId)) {
        console.log(`useWebRTC: Peer connection for ${targetUserId} already exists`);
        return peerConnections.current.get(targetUserId)!;
      }
      const peerConnection = new RTCPeerConnection(iceServers);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }

      peerConnection.ontrack = (event) => {
        console.log('useWebRTC: Received remote stream from:', targetUserId, 'Tracks:', event.streams[0].getTracks());
        const [remoteStream] = event.streams;
        setRemoteStreams((prev) => {
          const exists = prev.find((rs) => rs.userId === targetUserId);
          if (exists) {
            return prev.map((rs) =>
              rs.userId === targetUserId ? { ...rs, stream: remoteStream } : rs
            );
          }
          return [
            ...prev,
            {
              userId: targetUserId,
              stream: remoteStream,
              isAudioEnabled: remoteStream.getAudioTracks().length > 0,
              isVideoEnabled: remoteStream.getVideoTracks().length > 0,
            },
          ];
        });
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = socketManager.getSocket();
          if (socket) {
            socket.emit('iceCandidate', {
              toUserId: targetUserId,
              candidate: event.candidate,
              roomId,
            });
          }
        }
      };

      peerConnections.current.set(targetUserId, peerConnection);
      return peerConnection;
    },
    [roomId]
  );

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
        console.error('useWebRTC: Error creating offer:', error);
      }
    },
    [createPeerConnection, roomId]
  );

  const handleOffer = useCallback(
    async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
      const peerConnection = createPeerConnection(fromUserId);
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
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
        console.error('useWebRTC: Error handling offer:', error);
      }
    },
    [createPeerConnection, roomId]
  );

  const handleAnswer = useCallback(
    async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
      const peerConnection = peerConnections.current.get(fromUserId);
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('useWebRTC: Error handling answer:', error);
        }
      }
    },
    []
  );

  const handleIceCandidate = useCallback(
    async (fromUserId: string, candidate: RTCIceCandidateInit) => {
      const peerConnection = peerConnections.current.get(fromUserId);
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('useWebRTC: Error adding ICE candidate:', error);
        }
      }
    },
    []
  );

  const toggleVideo = useCallback(async () => {
    if (localStreamRef.current && localStreamRef.current.getVideoTracks().length > 0 && localStreamRef.current.getVideoTracks()[0].readyState === 'live') {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const newState = !videoTrack.enabled;
      videoTrack.enabled = newState;
      setIsVideoEnabled(newState);
      console.log('useWebRTC: Toggled video:', newState, 'Track:', videoTrack);
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('mediaStateChange', {
          roomId,
          userId,
          mediaType: 'video',
          isEnabled: newState,
        });
      }
    } else {
      const stream = await initializeLocalStream({
        video: true,
        audio: localStreamRef.current?.getAudioTracks()[0]?.enabled || false,
      });
      if (stream) {
        setIsVideoEnabled(true);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('mediaStateChange', {
            roomId,
            userId,
            mediaType: 'video',
            isEnabled: true,
          });
        }
      }
    }
  }, [roomId, userId, initializeLocalStream]);

  const toggleAudio = useCallback(async () => {
    if (localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0 && localStreamRef.current.getAudioTracks()[0].readyState === 'live') {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      const newState = !audioTrack.enabled;
      audioTrack.enabled = newState;
      setIsAudioEnabled(newState);
      console.log('useWebRTC: Toggled audio:', newState, 'Track:', audioTrack);
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('mediaStateChange', {
          roomId,
          userId,
          mediaType: 'audio',
          isEnabled: newState,
        });
      }
    } else {
      const stream = await initializeLocalStream({
        video: localStreamRef.current?.getVideoTracks()[0]?.enabled || false,
        audio: true,
      });
      if (stream) {
        setIsAudioEnabled(true);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('mediaStateChange', {
            roomId,
            userId,
            mediaType: 'audio',
            isEnabled: true,
          });
        }
      }
    }
  }, [roomId, userId, initializeLocalStream]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
          localStreamRef.current.removeTrack(videoTrack);
        }
        const stream = await initializeLocalStream({
          video: true,
          audio: localStreamRef.current?.getAudioTracks()[0]?.enabled || false,
        });
        if (stream) {
          setIsScreenSharing(false);
          setIsVideoEnabled(true);
          const socket = socketManager.getSocket();
          if (socket) {
            socket.emit('mediaStateChange', {
              roomId,
              userId,
              mediaType: 'video',
              isEnabled: true,
            });
          }
        }
      }
    } else {
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
        } else {
          localStreamRef.current = screenStream;
          setLocalStream(screenStream);
        }
        peerConnections.current.forEach((peerConnection, targetUserId) => {
          const sender = peerConnection
            .getSenders()
            .find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack).catch((error) => console.error(`useWebRTC: Error replacing track for ${targetUserId}:`, error));
          }
          // Trigger renegotiation
          createOffer(targetUserId);
        });
        setIsScreenSharing(true);
        setIsVideoEnabled(true);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('mediaStateChange', {
            roomId,
            userId,
            mediaType: 'video',
            isEnabled: true,
          });
        }
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          initializeLocalStream({
            video: true,
            audio: localStreamRef.current?.getAudioTracks()[0]?.enabled || false,
          });
        };
      } catch (error) {
        console.error('useWebRTC: Error starting screen share:', error);
        setStreamError('Failed to start screen sharing');
      }
    }
  }, [roomId, userId, isScreenSharing, initializeLocalStream]);

  useEffect(() => {
    if (!roomId || !userId || !isConnected || isInitialized.current) {
      console.log('useWebRTC: Skipping initialization', { roomId, userId, isConnected, isInitialized: isInitialized.current });
      return;
    }
    isInitialized.current = true;

    const socket = socketManager.getSocket();
    if (!socket || !socket.connected) {
      console.error('useWebRTC: Socket not connected during initialization');
      setStreamError('Socket not connected');
      isInitialized.current = false;
      return;
    }

    const handleOfferEvent = ({ fromUserId, offer }: any) => handleOffer(fromUserId, offer);
    const handleAnswerEvent = ({ fromUserId, answer }: any) => handleAnswer(fromUserId, answer);
    const handleIceCandidateEvent = ({ fromUserId, candidate }: any) => handleIceCandidate(fromUserId, candidate);
    const handleUserConnected = ({ userId: newUserId }: any) => {
      if (newUserId !== userId) {
        console.log('useWebRTC: User connected, creating offer for:', newUserId);
        createOffer(newUserId);
      }
    };
    const handleUserDisconnected = ({ userId: disconnectedUserId }: any) => {
      console.log('useWebRTC: User disconnected:', disconnectedUserId);
      const peerConnection = peerConnections.current.get(disconnectedUserId);
      if (peerConnection) {
        peerConnection.close();
        peerConnections.current.delete(disconnectedUserId);
      }
      setRemoteStreams((prev) => prev.filter((rs) => rs.userId !== disconnectedUserId));
    };
    const handleMediaStateChange = ({ userId: remoteUserId, mediaType, isEnabled }: any) => {
      setRemoteStreams((prev) =>
        prev.map((rs) =>
          rs.userId === remoteUserId
            ? {
                ...rs,
                [mediaType === 'audio' ? 'isAudioEnabled' : 'isVideoEnabled']: isEnabled,
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

    cleanupListeners.current.push(() => socket.off('offer', handleOfferEvent));
    cleanupListeners.current.push(() => socket.off('answer', handleAnswerEvent));
    cleanupListeners.current.push(() => socket.off('iceCandidate', handleIceCandidateEvent));
    cleanupListeners.current.push(() => socket.off('userConnected', handleUserConnected));
    cleanupListeners.current.push(() => socket.off('userDisconnected', handleUserDisconnected));
    cleanupListeners.current.push(() => socket.off('mediaStateChange', handleMediaStateChange));

    // Initialize with empty stream
    initializeLocalStream({ video: false, audio: false });

    return () => {
      console.log('useWebRTC: Cleaning up WebRTC');
      isInitialized.current = false;
      cleanupListeners.current.forEach((cleanup) => cleanup());
      cleanupListeners.current = [];
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      setLocalStream(null);
      setRemoteStreams([]);
      setStreamError(null);
    };
  }, [roomId, userId, isConnected, createOffer, handleOffer, handleAnswer, handleIceCandidate, initializeLocalStream]);

  return {
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    streamError,
    toggleVideo,
    toggleAudio,
    startScreenShare: toggleScreenShare,
  };
};