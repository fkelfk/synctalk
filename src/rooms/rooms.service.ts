import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from 'src/domain/room.entity';
import { UserEntity } from 'src/domain/user.entity';
import { RoomDTO } from './dto/room.dto';
import { RoomRepository } from './room.repository';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(RoomEntity) private roomRepository: RoomRepository,
  ) {}

    async createRoom(room: RoomDTO, user: UserEntity): Promise<RoomEntity> {
      const roominfo = new RoomEntity();
      roominfo.title = room.title,
      roominfo.description = room.description,
      roominfo.user = user

      return await this.save(roominfo)
    }

    async save(room: RoomDTO): Promise<RoomEntity> {
      return await this.roomRepository.save(room);
    }
}
