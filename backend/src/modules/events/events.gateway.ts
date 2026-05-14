import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000' },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth as Record<string, string> | undefined)?.['token'] ??
        client.handshake.headers?.['authorization']?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ tenantId: string; sub: string }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach tenantId to socket for room isolation
      client.data['tenantId'] = payload.tenantId;
      client.data['userId'] = payload.sub;

      // Join tenant room — isolation between tenants
      await client.join(`tenant:${payload.tenantId}`);

      this.logger.log(`Client connected: ${client.id} tenant:${payload.tenantId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit stock update to all terminals in same tenant
  emitStockUpdate(
    tenantId: string,
    payload: { productId: string; newStock: number; productName: string },
  ): void {
    this.server.to(`tenant:${tenantId}`).emit('stock:updated', payload);
  }

  // Emit new order to all terminals in same tenant
  emitNewOrder(
    tenantId: string,
    payload: { orderId: string; total: number; cashierName: string },
  ): void {
    this.server.to(`tenant:${tenantId}`).emit('order:created', payload);
  }
}
