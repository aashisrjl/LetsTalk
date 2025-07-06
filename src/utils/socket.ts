import { io, Socket } from 'socket.io-client';

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private isConnecting: boolean = false;

  constructor() {
    if (SocketManager.instance) {
      return SocketManager.instance;
    }
    SocketManager.instance = this;
  }

  connect() {
    if (this.isConnecting) {
      console.log('SocketManager: Connection in progress, returning existing socket');
      return this.socket;
    }
    if (this.socket && this.socket.connected) {
      console.log('SocketManager: Already connected, socket ID:', this.socket.id);
      return this.socket;
    }
    
    // Clean up disconnected socket
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
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000,
      forceNew: false, // Reuse existing connection when possible
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('SocketManager: Connected to server, socket ID:', this.socket?.id);
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.error('SocketManager: Connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      console.log('SocketManager: Disconnected:', reason);
    });

    this.socket.on('error', (err) => {
      console.error('SocketManager: Server error:', err);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('SocketManager: Disconnecting socket, ID:', this.socket.id);
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
      this.isConnecting = false;
    }
  }

  joinRoom(roomId: string, userId: string, userName: string, roomTitle: string) {
    if (this.socket && this.socket.connected) {
      if (this.roomId && this.roomId !== roomId) {
        console.log(`SocketManager: Leaving previous room ${this.roomId} before joining ${roomId}`);
        this.leaveRoom(this.roomId, userId);
      }
      this.roomId = roomId;
      console.log('SocketManager: Joining room:', { roomId, userId, userName, roomTitle });
      this.socket.emit('joinRoom', { roomId, userId, userName, roomTitle });
    } else {
      console.error('SocketManager: Cannot join room: Socket not connected');
    }
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.socket && this.socket.connected && this.roomId === roomId) {
      console.log('SocketManager: Leaving room:', { roomId, userId });
      this.socket.emit('leaveRoom', { roomId, userId });
      this.roomId = null;
    } else {
      console.error('SocketManager: Cannot leave room: Socket not connected or wrong roomId');
    }
  }

  sendMessage(message: string, userName: string) {
    if (this.socket && this.socket.connected && this.roomId) {
      console.log('SocketManager: Sending message:', { message, userName });
      this.socket.emit('sendMessage', {
        message,
        userName,
        time: new Date().toISOString(),
      });
    } else {
      console.error('SocketManager: Cannot send message: Socket not connected or no room joined');
    }
  }

  kickUser(roomId: string, userId: string) {
    if (this.socket && this.socket.connected && this.roomId === roomId) {
      console.log('SocketManager: Kicking user:', { roomId, userId });
      this.socket.emit('kickUser', { roomId, userId });
    } else {
      console.error('SocketManager: Cannot kick user: Socket not connected or wrong roomId');
    }
  }

  // Listener methods with cleanup
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
    return this.socket;
  }
}

export const socketManager = new SocketManager();