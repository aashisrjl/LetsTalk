import { io, Socket } from 'socket.io-client';

interface CustomSocket extends Socket {
  roomId?: string;
  userId?: string;
  userName?: string;
}

class SocketManager {
  private static instance: SocketManager;
  private socket: CustomSocket | null = null;
  private isConnecting: boolean = false;
  private isJoining: boolean = false;
  private lastJoinRoomParams: { roomId: string; userId: string; userName: string; roomTitle: string } | null = null;
  private lastJoinSuccess: boolean = false; // Track last join attempt success
  private reconnectDelay: number = 6000; // Increased to 6 seconds to align with server timeout

  private constructor() {
    if (SocketManager.instance) {
      return SocketManager.instance;
    }
    SocketManager.instance = this;
  }

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(): CustomSocket {
    if (this.isConnecting) {
      console.log('SocketManager: Connection in progress, returning existing socket');
      return this.socket as CustomSocket;
    }
    if (this.socket && this.socket.connected) {
      console.log('SocketManager: Already connected, socket ID:', this.socket.id);
      return this.socket;
    }
    
    if (this.socket && !this.socket.connected) {
      console.log('SocketManager: Cleaning up disconnected socket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnecting = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    console.log(`SocketManager: Initializing socket connection to ${backendUrl}`);
    
    this.socket = io(backendUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 20000,
      timeout: 25000,
      forceNew: false,
    }) as CustomSocket;

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('SocketManager: Connected to server, socket ID:', this.socket?.id);
      if (this.lastJoinRoomParams && !this.isJoining && !this.lastJoinSuccess) {
        this.joinRoom(
          this.lastJoinRoomParams.roomId,
          this.lastJoinRoomParams.userId,
          this.lastJoinRoomParams.userName,
          this.lastJoinRoomParams.roomTitle
        );
      }
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.error('SocketManager: Connection error:', err.message, err.stack);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      this.isJoining = false;
      this.lastJoinSuccess = false;
      console.log('SocketManager: Disconnected:', reason);
      delete this.socket?.roomId;
      delete this.socket?.userId;
      delete this.socket?.userName;
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`SocketManager: Reconnected after attempt ${attempt}, socket ID: ${this.socket?.id}`);
      if (this.lastJoinRoomParams && !this.isJoining && !this.lastJoinSuccess) {
        this.joinRoom(
          this.lastJoinRoomParams.roomId,
          this.lastJoinRoomParams.userId,
          this.lastJoinRoomParams.userName,
          this.lastJoinRoomParams.roomTitle
        );
      }
    });

    this.socket.on('error', (err) => {
      console.error('SocketManager: Server error:', err);
    });

    this.socket.on('room full', () => {
      this.isJoining = false;
      this.lastJoinSuccess = false;
      console.log('SocketManager: Room is full, stopping join attempts');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('SocketManager: Disconnecting socket, ID:', this.socket.id);
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.isJoining = false;
      this.lastJoinRoomParams = null;
      this.lastJoinSuccess = false;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  joinRoom(roomId: string, userId: string, userName: string, roomTitle: string) {
    if (this.isJoining || !this.socket) {
      console.log('SocketManager: Join in progress or no socket, skipping:', { roomId, userId });
      return;
    }
    if (this.socket.connected) {
      this.isJoining = true;
      this.lastJoinRoomParams = { roomId, userId, userName, roomTitle };
      console.log('SocketManager: Joining room:', { roomId, userId, userName, roomTitle });
      this.socket.emit('joinRoom', { roomId, userId, userName, roomTitle }, (response: any) => {
        // Optional callback for server acknowledgment (if implemented)
        console.log('SocketManager: JoinRoom response:', response);
      });
      this.socket.roomId = roomId;
      this.socket.userId = userId;
      this.socket.userName = userName;

      // Clear joining state on successful join or error
      const clearJoining = () => {
        this.isJoining = false;
        console.log('SocketManager: Cleared joining state for room:', roomId);
      };
      
      const handleRoomUsers = () => {
        this.lastJoinSuccess = true;
        clearJoining();
      };
      
      const handleError = (data: any) => {
        this.lastJoinSuccess = false;
        clearJoining();
        console.error('SocketManager: Join error:', data.message);
      };

      this.socket.once('roomUsers', handleRoomUsers);
      this.socket.once('error', handleError);
      this.socket.once('room full', handleError);
      setTimeout(clearJoining, 10000); // Fallback timeout
    } else {
      console.error('SocketManager: Cannot join room: Socket not connected');
      this.lastJoinRoomParams = { roomId, userId, userName, roomTitle };
      this.lastJoinSuccess = false;
    }
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.socket && this.socket.connected) {
      console.log('SocketManager: Leaving room:', { roomId, userId });
      this.socket.emit('leaveRoom', { roomId, userId });
      delete this.socket.roomId;
      delete this.socket.userId;
      delete this.socket.userName;
      this.lastJoinRoomParams = null;
      this.isJoining = false;
      this.lastJoinSuccess = false;
    } else {
      console.error('SocketManager: Cannot leave room: Socket not connected');
    }
  }

  sendMessage(message: string, userName: string) {
    if (this.socket && this.socket.connected) {
      const roomId = this.socket.roomId || this.lastJoinRoomParams?.roomId;
      console.log('SocketManager: Sending message:', { message, userName, roomId, socketConnected: this.socket.connected });
      this.socket.emit('sendMessage', { message, userName, time: new Date().toISOString() });
    } else {
      console.error('SocketManager: Cannot send message: Socket not connected', { 
        hasSocket: !!this.socket, 
        connected: this.socket?.connected,
        roomId: this.socket?.roomId,
        lastParams: this.lastJoinRoomParams
      });
    }
  }

  kickUser(roomId: string, userId: string) {
    if (this.socket && this.socket.connected && this.socket.roomId === roomId) {
      console.log('SocketManager: Kicking user:', { roomId, userId });
      this.socket.emit('kickUser', { roomId, userId });
    } else {
      console.error('SocketManager: Cannot kick user: not connected or wrong room');
    }
  }

  onRoomUsers(callback: (data: any) => void) {
    if (this.socket) {
      const handler = (data: any) => {
        console.log('SocketManager: Received roomUsers:', data);
        callback(data);
      };
      this.socket.on('roomUsers', handler);
      return () => this.socket?.off('roomUsers', handler);
    }
    return () => {};
  }

  onUserConnected(callback: (data: { userId: string; socketId: string }) => void) {
    if (this.socket) {
      const handler = (data: { userId: string; socketId: string }) => {
        console.log('SocketManager: Received userConnected:', data);
        callback(data);
      };
      this.socket.on('userConnected', handler);
      return () => this.socket?.off('userConnected', handler);
    }
    return () => {};
  }

  onUserDisconnected(callback: (data: { userId: string }) => void) {
    if (this.socket) {
      const handler = (data: { userId: string }) => {
        console.log('SocketManager: Received userDisconnected:', data);
        callback(data);
      };
      this.socket.on('userDisconnected', handler);
      return () => this.socket?.off('userDisconnected', handler);
    }
    return () => {};
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      const handler = (data: any) => {
        console.log('SocketManager: Received userJoined:', data);
        callback(data);
      };
      this.socket.on('userJoined', handler);
      return () => this.socket?.off('userJoined', handler);
    }
    return () => {};
  }

  onUserLeft(callback: (data: any) => void) {
    if (this.socket) {
      const handler = (data: any) => {
        console.log('SocketManager: Received userLeft:', data);
        callback(data);
      };
      this.socket.on('userLeft', handler);
      return () => this.socket?.off('userLeft', handler);
    }
    return () => {};
  }

  onReceiveMessage(callback: (data: any) => void) {
    if (this.socket) {
      const handler = (data: any) => {
        console.log('SocketManager: Received receiveMessage:', data);
        callback(data);
      };
      this.socket.on('receiveMessage', handler);
      return () => this.socket?.off('receiveMessage', handler);
    }
    return () => {};
  }

  onOwnershipTransferred(callback: (data: any) => void) {
    if (this.socket) {
      const handler = (data: any) => {
        console.log('SocketManager: Received ownershipTransferred:', data);
        callback(data);
      };
      this.socket.on('ownershipTransferred', handler);
      return () => this.socket?.off('ownershipTransferred', handler);
    }
    return () => {};
  }

  onKicked(callback: (data: any) => void) {
    if (this.socket) {
      const handler = (data: any) => {
        console.log('SocketManager: Received kicked:', data);
        callback(data);
      };
      this.socket.on('kicked', handler);
      return () => this.socket?.off('kicked', handler);
    }
    return () => {};
  }

  onError(callback: (data: any) => void) {
    if (this.socket) {
      const handler = (data: any) => {
        console.error('SocketManager: Received error:', data);
        callback(data);
      };
      this.socket.on('error', handler);
      return () => this.socket?.off('error', handler);
    }
    return () => {};
  }

  removeAllListeners() {
    if (this.socket) {
      console.log('SocketManager: Removing all socket listeners');
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    console.log('SocketManager: Getting socket:', this.socket?.connected ? 'Connected' : 'Not connected');
    return this.socket as CustomSocket;
  }
}

export const socketManager = SocketManager.getInstance();