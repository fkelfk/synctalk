import { Injectable, Logger } from '@nestjs/common';
import { createRoomID, createUserID } from 'ids';
import {
  AddParticipantFields,
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
import { Chat } from 'src/type';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly jwtService: JwtService,
  ) {}

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

    const payload1: ChatPayload1 = {
      roomID: createdChatRoom.roomid,
      title: fields.title,
      name: fields.name,
    };

    const payload2: ChatPayload2 = {
      subject: userID,
    };

    const signedString = this.jwtService.sign(payload1, payload2);

    return {
      chat: createdChatRoom,
      accessToken: signedString,
    };
  }

  async joinChatRoom(fields: JoinRoomFields) {
    const userID = createUserID();

    this.logger.debug(
      `Fetching chat with ID: ${fields.roomID} for user with ID: ${userID}`,
    );

    const joinedChat = await this.chatRepository.getChat(fields.roomID);
    console.log(joinedChat.roomid);
    console.log(joinedChat.title);

    this.logger.debug(
      `Creating token string for roomID: ${joinedChat.roomid} and userID: ${userID}`,
    );

    const payload1: ChatPayload1 = {
      roomID: joinedChat.roomid,
      name: fields.name,
      title: joinedChat.title,
    };

    const payload2: ChatPayload2 = {
      subject: userID,
    };

    const signedString = this.jwtService.sign(payload1, payload2);

    return {
      chat: joinedChat,
      accessToken: signedString,
    };
  }

  async rejoinChatRoom(fields: RejoinRoomFields) {
    this.logger.debug(
      `Rejoining chat with ID: ${fields.roomID} for user with ID: ${fields.userID} with name: ${fields.name}`,
    );

    const joinedChat = await this.chatRepository.addParticipant(fields);

    return joinedChat;
  }

  async addParticipant(addParticipant: AddParticipantFields): Promise<Chat> {
    return this.chatRepository.addParticipant(addParticipant);
  }

  async removeParticipants(
    roomID: string,
    userID: string,
  ): Promise<Chat | void> {
    const chat = await this.chatRepository.getChat(roomID);

    if (!chat.hasStarted) {
      const updatedChat = await this.chatRepository.removeParticipant(
        roomID,
        userID,
      );
      return updatedChat;
    }
  }
}
