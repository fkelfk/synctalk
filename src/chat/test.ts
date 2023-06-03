import { Injectable, Logger } from '@nestjs/common';
import { createRoomID, createUserID } from 'ids';
import {
  CreateRoomFields,
  JoinRoomFields,
  RejoinRoomFields,
} from './field/types';
import { ChatRepository } from './chat.repository';
import { JwtService } from '@nestjs/jwt';
import {
  ChatPayload1,
  ChatPayload2,
} from 'src/auth/security/payload.interface';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly jwtService: JwtService,
  ) {}

  private createPayload(
    roomID: string,
    title: string,
    name: string,
  ): ChatPayload1 {
    return {
      roomID,
      title,
      name,
    };
  }

  private generateAccessToken(
    payload1: ChatPayload1,
    payload2: ChatPayload2,
  ): string {
    return this.jwtService.sign(payload1, payload2);
  }

  private generateChatResponse(
    chat: any,
    payload1: ChatPayload1,
    payload2: ChatPayload2,
  ): any {
    const accessToken = this.generateAccessToken(payload1, payload2);
    return {
      chat,
      accessToken,
    };
  }

  async createChatRoom(fields: CreateRoomFields) {
    const roomID = createRoomID();
    const userID = createUserID();

    const createdChatRoom = await this.chatRepository.createChat({
      ...fields,
      roomID,
      userID,
    });

    this.logger.debug(
      `Creating token string for chatID: ${createdChatRoom.roomid} and userID: ${userID}`,
    );

    const payload1 = this.createPayload(
      createdChatRoom.roomid,
      fields.title,
      fields.name,
    );
    const payload2: ChatPayload2 = {
      subject: userID,
    };

    return this.generateChatResponse(createdChatRoom, payload1, payload2);
  }

  async joinChatRoom(fields: JoinRoomFields) {
    const userID = createUserID();

    this.logger.debug(
      `Fetching chat with ID: ${fields.roomID} for user with ID: ${userID}`,
    );

    const joinedChat = await this.chatRepository.getChat(fields.roomID);

    this.logger.debug(
      `Creating token string for chatID: ${joinedChat.roomid} and userID: ${userID}`,
    );

    const payload1 = this.createPayload(
      joinedChat.roomid,
      fields.title,
      fields.title,
    );
    const payload2: ChatPayload2 = {
      subject: userID,
    };

    return this.generateChatResponse(joinedChat, payload1, payload2);
  }

  async rejoinChatRoom(fields: RejoinRoomFields) {
    this.logger.debug(
      `Rejoining chat with ID: ${fields.roomID} for user with ID: ${fields.userID} with name: ${fields.name}`,
    );

    const joinedChat = await this.chatRepository.addParticipant(fields);

    return joinedChat;
  }
}
