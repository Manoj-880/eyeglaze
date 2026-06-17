import { io } from 'socket.io-client';

const getSocketUrl = (apiUrl: string | undefined): string => {
  if (!apiUrl) return 'http://localhost:5000';
  // Remove trailing slashes first
  const normalized = apiUrl.replace(/\/+$/, '');
  if (normalized.endsWith('/api')) {
    return normalized.slice(0, -4);
  }
  return normalized;
};

const socketUrl = getSocketUrl(import.meta.env.VITE_API_URL);

export const socket = io(socketUrl, {
  withCredentials: true,
  autoConnect: true,
});
