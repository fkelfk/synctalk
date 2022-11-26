import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    (roominfo.title = room.title),
      (roominfo.description = room.description),
      (roominfo.user = user);

    return await this.save(roominfo);
  }

  async getAllRoom(offset?: number, limit?: number) {
    const [items, count] = await this.roomRepository.findAndCount({
      skip: offset,
      take: limit,
    });

    return { items, count };
  }

  async getRoom(id: number): Promise<RoomEntity> {
    const room = await this.roomRepository.findOne({ where: { id } });
    return room;
  }

  async deleteRoom(id: number, user: UserEntity): Promise<void> {
    const result = await this.roomRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new UnauthorizedException(`This room is not yours`);
    }
  }

  async save(room: RoomDTO): Promise<RoomEntity> {
    return await this.roomRepository.save(room);
  }
}
