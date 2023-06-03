import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, JoinChatDto } from './dto/chat.Dto';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/security/auth.guard';
import { ChatPayload, RequestWithAuth } from 'src/auth/security/payload.interface';
import { ControllerAuthGuard } from './controller-auth-guard';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async create(
    @Body() createChatRoomDto: CreateChatDto,
    @Res() res: Response,
  ): Promise<any> {
    const response = await this.chatService.createChatRoom(createChatRoomDto);
    const data = response.chat;
    res.setHeader('Authorization', 'Bearer ' + response.accessToken);
    res.cookie('jwt', response.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1day
    });
    return res.send({ message: 'success', data: data });
  }

  @Post('/join')
  async joinchatroom(
    @Body() JoinChatDto: JoinChatDto,
    @Res() res: Response,
  ): Promise<any> {
    const response = await this.chatService.joinChatRoom(JoinChatDto);
    const data = response.chat;
    res.setHeader('Authorization', 'Bearer ' + response.accessToken);
    res.cookie('jwt', response.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1day
    });
    return res.send({ message: 'success', data: data });
  }

  @UseGuards(ControllerAuthGuard)
  @Post('/rejoin')
  async rejoin(@Req() request: RequestWithAuth) {
    const { userID, roomID, title, name } = request;
    const result = await this.chatService.rejoinChatRoom({
      userID,
      roomID,
      title,
      name
    });

    return result;
  }
}
