import { Body, Controller, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, JoinChatDto } from './dto/chat.Dto';
import { Response } from 'express';
import { RequestWithAuth } from 'src/auth/security/payload.interface';
import { ControllerAuthGuard } from './controller-auth-guard';

@UsePipes(new ValidationPipe())
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async create(
    @Body() createChatRoomDto: CreateChatDto,
    @Res() res: Response,
  ): Promise<any> {
    const response = await this.chatService.createChatRoom(createChatRoomDto);
    // const data = response.chat;
    res.setHeader('Authorization', 'Bearer ' + response.accessToken);
    res.cookie('jwt', response.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1day
    });
    return res.send({ message: 'success', data: response });
  }

  @Post('/join')
  async joinchatroom(
    @Body() JoinChatDto: JoinChatDto,
    @Res() res: Response,
  ): Promise<any> {
    const response = await this.chatService.joinChatRoom(JoinChatDto);
    res.setHeader('Authorization', 'Bearer ' + response.accessToken);
    res.cookie('jwt', response.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1day
    });
    return res.send({ message: 'success', data: response });
  }

  @UseGuards(ControllerAuthGuard)
  @Post('/rejoin')
  async rejoin(@Req() request: RequestWithAuth) {
    const { userID, roomID, title, name } = request;
    const result = await this.chatService.rejoinChatRoom({
      userID,
      roomID,
      title,
      name,
    });

    return result;
  }
}
