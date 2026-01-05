import { io } from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create socket instance with proper configuration
const socket = io(ENDPOINT, {
  autoConnect: false, // Don't connect immediately
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
});

// Connection event handlers
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔴 Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 Attempting to reconnect...', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.error('❌ Reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed - max attempts reached');
});

export default socket;