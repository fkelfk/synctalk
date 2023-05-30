import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { redisModule } from 'src/modules.config';
import { RoomRepository } from 'src/rooms/room.repository';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [redisModule],
  providers: [ChatGateway, ChatService, RoomRepository, ChatRepository],
  controllers: [ChatController],
})
export class ChatModule {}
