// import { Logger, UseGuards } from '@nestjs/common';
// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   OnGatewayInit,
// } from '@nestjs/websockets';
// import { Socket, Server, Namespace } from 'socket.io';
// import { AuthGuard } from 'src/auth/security/auth.guard';
// import { RolesGuard } from 'src/auth/security/role.guard';
// import { Roles } from 'src/decorator/role.decorator';
// import { RoleType } from 'src/role-type';
// import { ChatService } from './chat.service';

// @WebSocketGateway(
// //   3131, {
// //   cors: { origin: '*' },
//   {namespace: 'chats'}
// // }
// )
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
//   private readonly logger = new Logger(ChatGateway.name)
//   constructor(private readonly chatService: ChatService){}

//   afterInit(): void {
//     this.logger.log('Websocket Gateway Initaialized')
//   }

// @WebSocketServer()
// io: Namespace;
// server: Server;
// users: number = 0;

// @UseGuards(AuthGuard, RolesGuard)
// @Roles(RoleType.USER)
// async handleConnection() {
//   this.users++;
//   this.server.emit('users', this.users);
// }

//   async handleDisconnect() {
//     this.users--;
//     this.server.emit('users', this.users);
//   }

//   @SubscribeMessage('chat')
//   async onChat(client: Socket, message) {
//     client.broadcast.emit('chat', message);
//   }
// }

import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { ChatService } from './chat.service';
import { SocketWithAuth } from 'src/auth/security/payload.interface';
import { WsCatchAllFilter } from 'src/decorator/ws.catch.all.filter';

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'chats',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() io: Namespace;

  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  async handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug(
      `Socket connected with userID: ${client.userID}, roomID: ${client.roomID}, and name: "${client.name}"`,
    );

    this.logger.log(`WS Client with id: ${client.id} connected!`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);

    const roomName = client.roomID;
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.debug(
      `userID: ${client.userID} joined room with name ${roomName}`,
    );
    this.logger.debug(
      `Total clients connented to room '${roomName}': ${connectedClients}`,
    );

    const updatedChat = await this.chatService.addParticipant({
      roomID: client.roomID,
      userID: client.userID,
      title: client.title,
      name: client.name,
    });

    this.io.to(roomName).emit('chat_updated', updatedChat);
  }

  async handleDisconnect(client: SocketWithAuth) {
    const socket = this.io.sockets;
    const { roomID, userID } = client;
    const updatedChat = await this.chatService.removeParticipants(
      roomID,
      userID,
    );

    const roomName = client.roomID;
    const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.debug(`Number of connected sockets: ${socket.size}`);
    this.logger.debug(
      `Total clients connected to room '${roomName}': ${clientCount}`,
    );

    if (updatedChat) {
      this.io.to(roomID).emit('chat_updated', updatedChat);
    }
  }
}
