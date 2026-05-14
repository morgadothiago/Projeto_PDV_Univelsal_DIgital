import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(token: string): Socket {
  if (socket?.connected) return socket

  const wsUrl = new URL(process.env.NEXT_PUBLIC_API_URL!).origin

  socket = io(`${wsUrl}/events`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
  })

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
