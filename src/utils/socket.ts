import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private roomId: string | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
        withCredentials: true,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
    }
  }

  joinRoom(roomId: string, userId: string, userName: string, roomTitle: string) {
    if (this.socket) {
      this.roomId = roomId;
      this.socket.emit('joinRoom', { roomId, userId, userName, roomTitle });
    }
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('leaveRoom', { roomId, userId });
      this.roomId = null;
    }
  }

  sendMessage(message: string, userName: string) {
    if (this.socket && this.roomId) {
      this.socket.emit('sendMessage', {
        message,
        userName,
        time: new Date().toISOString(),
      });
    }
  }

  kickUser(roomId: string, targetUserId: string) {
    if (this.socket) {
      this.socket.emit('kickUser', { roomId, targetUserId });
    }
  }

  onRoomUsers(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('roomUsers', callback);
    }
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('userJoined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('userLeft', callback);
    }
  }

  onReceiveMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  onOwnershipTransferred(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ownershipTransferred', callback);
    }
  }

  onKicked(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('kicked', callback);
    }
  }

  onError(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();
