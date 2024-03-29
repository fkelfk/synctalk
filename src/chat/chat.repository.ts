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

  async createChat({
    title,
    roomID,
    userID,
    name,
  }: CreateRoomData): Promise<Chat> {
    const initialRoom = {
      roomid: roomID,
      title,
      participants: {},
      adminID: userID,
      name: name,
      hasStarted: false
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

  async getChat(roomID: string) {
    this.logger.log(`Attempting to get chat with: ${roomID}`);

    const key = `rooms:${roomID}`;

    try {
      const currentRoom = (await this.redisClient.call(
        'JSON.GET',
        key,
        '.',
      )) as string;

      this.logger.verbose(currentRoom);

      return JSON.parse(currentRoom);
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

  async removeParticipant(roomID: string, userID: string): Promise<Chat> {
    this.logger.log(`removing userID: ${userID} from room: ${roomID}`);

    const key = `rooms:${roomID}`;
    const participantPath = `.participants.${userID}`;

    try {
      await this.redisClient.call('JSON.DEL', key, participantPath);

      return this.getChat(roomID);
    } catch (e) {
      this.logger.error(
        `Failed to remove userID: ${userID} from room: ${roomID}`,
        e,
      );
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }
}
