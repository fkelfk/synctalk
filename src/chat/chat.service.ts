import { Injectable, Logger } from '@nestjs/common';
import { createRoomID, createUserID } from 'ids';
import {
  CreateRoomFields,
  JoinRoomFields,
  RejoinRoomFields,
} from './field/types';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly chatRepository: ChatRepository) {}

  async createChatRoom(fields: CreateRoomFields) {
    const roomID = createRoomID();
    const userID = createUserID();

    const createChatRoom = await this.chatRepository.createChat({
      ...fields,
      roomID,
      userID,
    });

    return {
      chat: createChatRoom,
    };
  }

  async JoinChatRoom(fields: JoinRoomFields) {
    const userID = createUserID();

    this.logger.debug(
      `Fetching chat with ID: ${fields.roomID} for user with ID: ${userID}`,
    );

    const joinedChat = await this.chatRepository.getChat(fields.roomID);

    return {
      chat: joinedChat,
    };
  }

  async RejoinChatRoom(fields: RejoinRoomFields) {
    this.logger.debug(
      `Rejoining chat with ID: ${fields.roomID} for user with ID: ${fields.userID} with name: ${fields.name}`,
    );

    const joinedChat = await this.chatRepository.addParticipant(fields);

    return joinedChat;
  }
}
