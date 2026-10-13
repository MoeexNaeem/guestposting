import { io } from 'socket.io-client';

// One shared connection per browser tab. The Vite app connected to a hard-coded
// http://localhost:5000; this connects to whatever origin served the page,
// which is the custom server that also hosts socket.io.
let socket;

export const getSocket = () => {
  if (!socket) socket = io();
  return socket;
};
