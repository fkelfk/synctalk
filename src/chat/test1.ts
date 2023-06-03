import { Injectable, Logger } from '@nestjs/common';
import { createRoomID, createUserID } from 'ids';
import { ChatRepository } from './chat.repository';
import { JwtService } from '@nestjs/jwt';
import { ChatPayload1, ChatPayload2 } from 'src/auth/security/payload.interface';
import { CreateRoomFields, JoinRoomFields, RejoinRoomFields } from './field/types';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly jwtService: JwtService,
  ) {}

  private createTokenString(roomID: string, title: string, name: string): string {
    const payload1: ChatPayload1 = { roomID, title, name };
    const payload2: ChatPayload2 = { subject: createUserID() };
    return this.jwtService.sign(payload1, payload2);
  }

  async createChatRoom(fields: CreateRoomFields) {
    const roomID = createRoomID();
    const userID = createUserID();
    const chat = await this.chatRepository.createChat({ ...fields, roomID, userID });
    this.logger.debug(
        `Creating token string for chatID: ${chat.roomid} and userID: ${userID}`,
      );
    const accessToken = this.createTokenString(chat.roomid, fields.title, fields.name);
    return { chat, accessToken };
  }

  async joinChatRoom(fields: JoinRoomFields) {
    const chat = await this.chatRepository.getChat(fields.roomID);
    const accessToken = this.createTokenString(chat.roomid, fields.title, fields.title);
    return { chat, accessToken };
  }

  async rejoinChatRoom(fields: RejoinRoomFields) {
    const { roomID, userID, name } = fields;
    this.logger.debug(`Rejoining chat with ID: ${roomID} for user with ID: ${userID} with name: ${name}`);
    const joinedChat = await this.chatRepository.addParticipant(fields);
    return joinedChat;
  }
}
