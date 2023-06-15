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
  Patch,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Roles } from 'src/decorator/role.decorator';
import { AuthGuard } from 'src/auth/security/auth.guard';
import { RolesGuard } from 'src/auth/security/role.guard';
import { RoleType } from 'src/role-type';
import { RoomEntity } from 'src/domain/room.entity';
import { RoomDTO } from './dto/room.dto';
import { PaginationParams } from '../utils/types/paginationParams';
import { QueryFailedExceptionFilter } from 'src/decorator/query.exceptions.filter';
import { QuerySpeedInterceptor } from 'src/decorator/query.reunner';

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

  @Get('/index')
  async paginationCoveringIndex1(@Query() { offset, limit }: PaginationParams) {
    return await this.roomsService.paginationCoveringIndex(offset, limit);
  }

  @Get('/join')
  async join(@Body() roomCode: string) {
    return await this.roomsService.joinRoom(roomCode);
  }

  @Get('/:id')
  async getRoom(@Param('id') id: number): Promise<RoomEntity> {
    return await this.roomsService.getRoom(id);
  }

  @Get('/find/:text')
  @UseFilters(QueryFailedExceptionFilter)
  async findRoomByText(@Param('text') text: string): Promise<RoomEntity[]> {
    return await this.roomsService.findRoomByText(text);
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
  async updateRoom(
    @Req() req,
    @Body() room: RoomDTO,
    @Param('id') id,
  ): Promise<void> {
    const user = req.user;
    return this.roomsService.updateRoom(id, room, user.id);
  }

  @Patch('/update/:roomid')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  async updataMultiData(
    @Req() req,
    @Body() room: RoomEntity,
    @Param('roomid') roomid,
  ): Promise<void> {
    const user = req.user;
    return this.roomsService.updateRoomAnduser(
      roomid,
      room.title,
      room.description,
      room.user,
    );
  }
}
