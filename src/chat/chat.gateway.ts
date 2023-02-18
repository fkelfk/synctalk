import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(3131, {
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  users: number = 0;

  async handleConnection() {
    this.users++;
    this.server.emit('users', this.users);
    console.log(this.users);
  }

  async handleDisconnect() {
    this.users--;
    this.server.emit('users', this.users);
    console.log(this.users);
  }

  @SubscribeMessage('chat')
  async onChat(client: Socket, message) {
    console.log(client.rooms);
    console.log(message);
    client.broadcast.emit('chat', message);
  }
}
