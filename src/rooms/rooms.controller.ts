import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Roles } from 'src/decorator/role.decorator';
import { AuthGuard } from 'src/auth/security/auth.guard';
import { RolesGuard } from 'src/auth/security/role.guard';
import { RoleType } from 'src/role-type';
import { RoomEntity } from 'src/domain/room.entity';
import { RoomDTO } from './dto/room.dto';
import { PaginationParams } from '../utils/types/paginationParams';
import { UserEntity } from 'src/domain/user.entity';

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
  async getAllRoom(@Query() { offset, limit }: PaginationParams) {
    return await this.roomsService.getAllRoom(offset, limit);
  }

  @Get('/:id')
  async getRoom(@Param('id') id: number): Promise<RoomEntity> {
    return await this.roomsService.getRoom(id);    
  }

  @Delete('/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  async deleteRoom(@Req() req, @Param('id') id): Promise<void> {
    const user = req.user;
    return this.roomsService.deleteRoom(id, user.id);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  async updateRoom(@Req() req, @Body() room: RoomDTO,  @Param('id') id) : Promise<void> {
    const user = req.user;
    return this.roomsService.updateRoom(id, room, user.id);
  }
}
