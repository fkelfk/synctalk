import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, JoinChatDto } from './dto/chat.Dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  
  @Post()
  async create(@Body() createChatRoomDto: CreateChatDto) {
    return await this.chatService.createChatRoom(createChatRoomDto);
  }

  @Post('/join')
  async joinchatroom(@Body() JoinChatDto:JoinChatDto) {
    return await this.chatService.JoinChatRoom(JoinChatDto)
  }

  @Post('/rejoin')
  async rejoin(@Req() request){
    const {userID, roomID, name} = request;
  }
}
