import { CACHE_MANAGER, Controller, Get, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService:ChatService ) {}
  @Get('cache')
  getCache() {
    return this.chatService.getCache();
  }

}
