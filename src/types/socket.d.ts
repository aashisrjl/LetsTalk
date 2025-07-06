// types/socket.d.ts
import { Socket as IOSocket } from 'socket.io-client';

declare module 'socket.io-client' {
  interface Socket extends IOSocket {
    roomId?: string;
    userId?: string;
    userName?: string;
  }
}