import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Roles } from 'src/decorator/role.decorator';
import { AuthGuard } from 'src/auth/security/auth.guard';
import { RolesGuard } from 'src/auth/security/role.guard';
import { RoleType } from 'src/role-type';
import { RoomEntity } from 'src/domain/room.entity';
import { RoomDTO } from './dto/room.dto';
import { PaginationParams } from '../utils/types/paginationParams';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post('/create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  async createRoom(@Req() req, @Body() room: RoomDTO): Promise<RoomEntity> {
    const user = req.user;
    return await this.roomsService.createRoom(room, user.id);
  }

  @Get('/main')
  async getAllRoom(
    @Query() { offset, limit }: PaginationParams
  ) {
    return this.roomsService.getAllRoom(offset, limit);
  }

  @Get('/:id')
  async getRoom(@Param('id') id: number): Promise<RoomEntity> {
    return this.roomsService.getRoom(id);
  }
}