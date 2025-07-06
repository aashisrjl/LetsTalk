import { useState, useEffect, useRef, useCallback } from 'react';
import { socketManager } from '@/utils/socket';

interface RemoteStream {
  userId: string;
  stream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

interface OfferData {
  fromUserId: string;
  toUserId: string;
  offer: RTCSessionDescriptionInit;
  roomId: string;
}

interface AnswerData {
  fromUserId: string;
  toUserId: string;
  answer: RTCSessionDescriptionInit;
  roomId: string;
}

interface IceCandidateData {
  fromUserId: string;
  toUserId: string;
  candidate: RTCIceCandidateInit;
  roomId: string;
}

interface MediaStateChangeData {
  userId: string;
  mediaType: 'audio' | 'video';
  isEnabled: boolean;
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
  const otherUsers = useRef<Set<string>>(new Set());

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const initializeLocalStream = useCallback(async () => {
    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsAudioEnabled(true);
        setIsVideoEnabled(true);
        setStreamError(null);
        console.log('useWebRTC: Local stream initialized:', stream.id, 'Tracks:', {
          video: stream.getVideoTracks(),
          audio: stream.getAudioTracks(),
        });
        peerConnections.current.forEach((pc, targetUserId) => {
          stream.getTracks().forEach((track) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === track.kind);
            if (sender) {
              sender.replaceTrack(track).catch((error) =>
                console.error(`useWebRTC: Error replacing track for ${targetUserId}:`, error)
              );
            } else {
              pc.addTrack(track, stream);
            }
          });
          if (!pc.currentRemoteDescription) createOffer(targetUserId);
        });
        return stream;
      } catch (error: any) {
        console.error('useWebRTC: Error accessing media devices:', error);
        setStreamError(error.message || 'Failed to access media devices');
        setIsAudioEnabled(false);
        setIsVideoEnabled(false);
        return null;
      }
    }
    return localStreamRef.current;
  }, []);

  const createPeerConnection = useCallback((targetUserId: string) => {
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
      console.log('useWebRTC: Received remote stream from:', targetUserId, 'Tracks:', event.streams[0]?.getTracks());
      const remoteStream = event.streams[0] || null;
      setRemoteStreams((prev) => {
        const exists = prev.find((rs) => rs.userId === targetUserId);
        return exists
          ? prev.map((rs) =>
              rs.userId === targetUserId ? { ...rs, stream: remoteStream } : rs
            )
          : [
              ...prev,
              {
                userId: targetUserId,
                stream: remoteStream,
                isAudioEnabled: remoteStream?.getAudioTracks().length > 0 || false,
                isVideoEnabled: remoteStream?.getVideoTracks().length > 0 || false,
              },
            ];
      });
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('iceCandidate', {
            fromUserId: userId,
            toUserId: targetUserId,
            candidate: event.candidate,
            roomId,
          } as IceCandidateData);
        }
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`useWebRTC: PeerConnection state for ${targetUserId}: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
        peerConnections.current.delete(targetUserId);
        setRemoteStreams((prev) => prev.filter((rs) => rs.userId !== targetUserId));
      }
    };

    peerConnections.current.set(targetUserId, peerConnection);
    return peerConnection;
  }, [roomId, userId]);

  const createOffer = useCallback(async (targetUserId: string) => {
    const peerConnection = createPeerConnection(targetUserId);
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('offer', {
          fromUserId: userId,
          toUserId: targetUserId,
          offer,
          roomId,
        } as OfferData);
      }
    } catch (error) {
      console.error('useWebRTC: Error creating offer:', error);
    }
  }, [createPeerConnection, roomId, userId]);

  const handleOffer = useCallback(
    async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
      if (fromUserId === userId) return; // Ignore self-offers
      const peerConnection = createPeerConnection(fromUserId);
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('answer', {
            fromUserId: userId,
            toUserId: fromUserId,
            answer,
            roomId,
          } as AnswerData);
        }
      } catch (error) {
        console.error('useWebRTC: Error handling offer:', error);
      }
    },
    [createPeerConnection, roomId, userId]
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
    if (localStreamRef.current && localStreamRef.current.getVideoTracks().length > 0) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const newState = !videoTrack.enabled;
      videoTrack.enabled = newState;
      setIsVideoEnabled(newState);
      console.log('useWebRTC: Toggled video:', newState, 'Track:', videoTrack);
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('mediaStateChange', {
          userId,
          mediaType: 'video',
          isEnabled: newState,
        } as MediaStateChangeData);
      }
    } else {
      const stream = await initializeLocalStream();
      if (stream) {
        setIsVideoEnabled(true);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('mediaStateChange', {
            userId,
            mediaType: 'video',
            isEnabled: true,
          } as MediaStateChangeData);
        }
      }
    }
  }, [userId, initializeLocalStream]);

  const toggleAudio = useCallback(async () => {
    if (localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      const newState = !audioTrack.enabled;
      audioTrack.enabled = newState;
      setIsAudioEnabled(newState);
      console.log('useWebRTC: Toggled audio:', newState, 'Track:', audioTrack);
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('mediaStateChange', {
          userId,
          mediaType: 'audio',
          isEnabled: newState,
        } as MediaStateChangeData);
      }
    } else {
      const stream = await initializeLocalStream();
      if (stream) {
        setIsAudioEnabled(true);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('mediaStateChange', {
            userId,
            mediaType: 'audio',
            isEnabled: true,
          } as MediaStateChangeData);
        }
      }
    }
  }, [userId, initializeLocalStream]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks().filter((t) => t.kind === 'video');
        videoTracks.forEach((track) => track.stop());
        localStreamRef.current.getTracks().forEach((track) => {
          if (track.kind === 'video') localStreamRef.current?.removeTrack(track);
        });
        const stream = await initializeLocalStream();
        if (stream) {
          setIsScreenSharing(false);
          setIsVideoEnabled(true);
          const socket = socketManager.getSocket();
          if (socket) {
            socket.emit('mediaStateChange', {
              userId,
              mediaType: 'video',
              isEnabled: true,
            } as MediaStateChangeData);
          }
        }
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const videoTrack = screenStream.getVideoTracks()[0];
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
          localStreamRef.current.addTrack(videoTrack);
          setLocalStream(new MediaStream([...localStreamRef.current.getTracks()]));
        } else {
          localStreamRef.current = screenStream;
          setLocalStream(screenStream);
        }
        peerConnections.current.forEach((pc, targetUserId) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack).catch((error) =>
            console.error(`useWebRTC: Error replacing track for ${targetUserId}:`, error)
          );
          if (!pc.currentRemoteDescription) createOffer(targetUserId);
        });
        setIsScreenSharing(true);
        setIsVideoEnabled(true);
        const socket = socketManager.getSocket();
        if (socket) {
          socket.emit('mediaStateChange', {
            userId,
            mediaType: 'video',
            isEnabled: true,
          } as MediaStateChangeData);
        }
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          initializeLocalStream();
        };
      } catch (error) {
        console.error('useWebRTC: Error starting screen share:', error);
        setStreamError('Failed to start screen sharing');
      }
    }
  }, [userId, isScreenSharing, initializeLocalStream]);

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

    const initializeConnections = async () => {
      const stream = await initializeLocalStream();
      if (stream && socket.roomId === roomId) {
        socket.emit('requestRoomUsers', { roomId }, () => {
          console.log('useWebRTC: Successfully requested room users');
        });
      }
    };

    const handleOfferEvent = ({ fromUserId, toUserId, offer, roomId: offerRoomId }: OfferData) =>
      toUserId === userId && offerRoomId === roomId && handleOffer(fromUserId, offer);
    const handleAnswerEvent = ({ fromUserId, toUserId, answer, roomId: answerRoomId }: AnswerData) =>
      toUserId === userId && answerRoomId === roomId && handleAnswer(fromUserId, answer);
    const handleIceCandidateEvent = ({ fromUserId, toUserId, candidate, roomId: candidateRoomId }: IceCandidateData) =>
      toUserId === userId && candidateRoomId === roomId && handleIceCandidate(fromUserId, candidate);
    const handleUserConnected = ({ userId: newUserId, socketId }: { userId: string; socketId: string }) => {
      if (newUserId !== userId && !otherUsers.current.has(newUserId)) {
        otherUsers.current.add(newUserId);
        console.log('useWebRTC: User connected, creating offer for:', newUserId);
        createOffer(newUserId);
      }
    };
    const handleRoomUsers = ({ users }: { users: { userId: string }[] }) => {
      const newUsers = users.filter((u) => u.userId !== userId && !peerConnections.current.has(u.userId));
      newUsers.forEach((u) => {
        otherUsers.current.add(u.userId);
        createOffer(u.userId);
      });
    };
    const handleUserDisconnected = ({ userId: disconnectedUserId }: { userId: string }) => {
      console.log('useWebRTC: User disconnected:', disconnectedUserId);
      const peerConnection = peerConnections.current.get(disconnectedUserId);
      if (peerConnection) {
        peerConnection.close();
        peerConnections.current.delete(disconnectedUserId);
      }
      otherUsers.current.delete(disconnectedUserId);
      setRemoteStreams((prev) => prev.filter((rs) => rs.userId !== disconnectedUserId));
    };
    const handleMediaStateChange = ({ userId: remoteUserId, mediaType, isEnabled }: MediaStateChangeData) => {
      setRemoteStreams((prev) =>
        prev.map((rs) =>
          rs.userId === remoteUserId
            ? { ...rs, [mediaType === 'audio' ? 'isAudioEnabled' : 'isVideoEnabled']: isEnabled }
            : rs
        )
      );
    };
    const handleRoomFull = () => {
      setStreamError('Room is full');
    };

    socket.on('offer', handleOfferEvent);
    socket.on('answer', handleAnswerEvent);
    socket.on('iceCandidate', handleIceCandidateEvent);
    socket.on('userConnected', handleUserConnected);
    socket.on('roomUsers', handleRoomUsers);
    socket.on('userDisconnected', handleUserDisconnected);
    socket.on('mediaStateChange', handleMediaStateChange);
    socket.on('room full', handleRoomFull);

    cleanupListeners.current.push(() => socket.off('offer', handleOfferEvent));
    cleanupListeners.current.push(() => socket.off('answer', handleAnswerEvent));
    cleanupListeners.current.push(() => socket.off('iceCandidate', handleIceCandidateEvent));
    cleanupListeners.current.push(() => socket.off('userConnected', handleUserConnected));
    cleanupListeners.current.push(() => socket.off('roomUsers', handleRoomUsers));
    cleanupListeners.current.push(() => socket.off('userDisconnected', handleUserDisconnected));
    cleanupListeners.current.push(() => socket.off('mediaStateChange', handleMediaStateChange));
    cleanupListeners.current.push(() => socket.off('room full', handleRoomFull));

    initializeConnections();

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
      otherUsers.current.clear();
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