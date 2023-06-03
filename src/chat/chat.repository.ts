import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cluster } from 'ioredis';
import { IORedisKey } from 'src/redis.module';
import { AddParticipantData, CreateRoomData } from './field/types';
import { Chat } from 'src/type';

@Injectable()
export class ChatRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(ChatRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Cluster,
  ) {
    this.ttl = configService.get('CHAT_DURATION');
  }

  async createChat({ topic, roomID, userID, name }: CreateRoomData): Promise<Chat> {
    const initialRoom = {
      roomid: roomID,
      topic,
      participants: {},
      adminID: userID,
      name: name
    };

    this.logger.log(
      `Creating new room: ${JSON.stringify(initialRoom, null, 2)} with TTL ${
        this.ttl
      }`,
    );

    const key = `rooms:${roomID}`;

    try {
      await this.redisClient
        .multi([
          ['call', 'JSON.SET', key, '.', JSON.stringify(initialRoom)],
          ['expire', key, this.ttl],
        ])
        .exec();
      return initialRoom;
    } catch (e) {
      this.logger.error(
        `Failed to add Room ${JSON.stringify(initialRoom)}\n${e}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async getChat(roomID: string): Promise<Chat> {
    this.logger.log(`Attempting to get chat with: ${roomID}`);

    const key = `rooms:${roomID}`;

    try {
      const currentRoom = (await this.redisClient.call(
        'JSON.GET',
        key,
        '.',
      )) as Chat;

      this.logger.verbose(currentRoom);

      return currentRoom;
    } catch (e) {
      this.logger.error(`Failed to get roomID ${roomID}`);
      throw e;
    }
  }

  async addParticipant({
    roomID,
    userID,
    name,
  }: AddParticipantData): Promise<Chat> {
    this.logger.log(
      `Attempting to add a participant with userID/name: ${userID}/${name} to roomID: ${roomID}`,
    );

    const key = `rooms:${roomID}`;
    const participantPath = `.participants.${userID}`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        key,
        participantPath,
        JSON.stringify(name),
      );

      return this.getChat(roomID);
    } catch (e) {
      this.logger.error(
        `Failed to add a participant with userID/name: ${userID}/${name} to roomID: ${roomID}`,
      );
      throw new InternalServerErrorException(
        `Failed to add a participant with userID/name: ${userID}/${name} to roomID: ${roomID}`,
      );
    }
  }
}
