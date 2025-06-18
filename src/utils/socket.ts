import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private roomId: string | null = null;

  connect() {
    if (!this.socket || !this.socket.connected) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      console.log(`Initializing socket connection to ${backendUrl}`);
      this.socket = io(backendUrl, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('SocketManager: Connected to server, socket ID:', this.socket?.id);
      });

      this.socket.on('connect_error', (err) => {
        console.error('SocketManager: Connection error:', err.message);
      });

      this.socket.on('error', (err) => {
        console.error('SocketManager: Server error:', err);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
    }
  }

  joinRoom(roomId: string, userId: string, userName: string, roomTitle: string) {
    if (this.socket && this.socket.connected) {
      this.roomId = roomId;
      console.log('Joining room:', { roomId, userId, userName, roomTitle });
      this.socket.emit('joinRoom', { roomId, userId, userName, roomTitle });
    } else {
      console.error('Cannot join room: Socket not connected');
    }
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.socket && this.socket.connected) {
      console.log('Leaving room:', { roomId, userId });
      this.socket.emit('leaveRoom', { roomId, userId });
      this.roomId = null;
    } else {
      console.error('Cannot leave room: Socket not connected');
    }
  }

  sendMessage(message: string, userName: string) {
    if (this.socket && this.socket.connected && this.roomId) {
      console.log('Sending message:', { message, userName });
      this.socket.emit('sendMessage', {
        message,
        userName,
        time: new Date().toISOString(),
      });
    } else {
      console.error('Cannot send message: Socket not connected or no room joined');
    }
  }

  kickUser(roomId: string, userId: string) {
    if (this.socket && this.socket.connected) {
      console.log('Kicking user:', { roomId, userId });
      this.socket.emit('kickUser', { roomId, userId });
    } else {
      console.error('Cannot kick user: Socket not connected');
    }
  }

  onRoomUsers(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('roomUsers', (data) => {
        console.log('Received roomUsers:', data);
        callback(data);
      });
    }
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('userJoined', (data) => {
        console.log('Received userJoined:', data);
        callback(data);
      });
    }
  }

  onUserLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('userLeft', (data) => {
        console.log('Received userLeft:', data);
        callback(data);
      });
    }
  }

  onReceiveMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('receiveMessage', (data) => {
        console.log('Received receiveMessage:', data);
        callback(data);
      });
    }
  }

  onOwnershipTransferred(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ownershipTransferred', (data) => {
        console.log('Received ownershipTransferred:', data);
        callback(data);
      });
    }
  }

  onKicked(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('kicked', (data) => {
        console.log('Received kicked:', data);
        callback(data);
      });
    }
  }

  onError(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('error', (data) => {
        console.error('Received error:', data);
        callback(data);
      });
    }
  }

  removeAllListeners() {
    if (this.socket) {
      console.log('Removing all socket listeners');
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    console.log('Getting socket:', this.socket?.connected ? 'Connected' : 'Not connected');
    return this.socket;
  }
}

export const socketManager = new SocketManager();