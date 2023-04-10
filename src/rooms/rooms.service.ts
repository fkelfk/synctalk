import {
  Inject,
  Injectable,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pool } from 'pg';
import { RoomEntity } from 'src/domain/room.entity';
import { UserEntity } from 'src/domain/user.entity';
import { DataSource, Like } from 'typeorm';
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

  async findRoomByText(text: string): Promise<RoomEntity[]> {
    return await this.roomRepository.find({
      where: {
        title: Like(`%${text}%`),
      },
    });
  }

  async updateRoomAnduser(
    roomid: number,
    title?: string,
    description?: string,
    userdata?: UserEntity,
  ): Promise<any> {
    const data = {
      title: title,
      description: description,
      user: userdata,
    };
    const room = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.user', 'user')
      .update()
      .set({
        title: data.title,
        description: data.description,
        user: { username: data.user.username },
      })
      .where('room.id = :id', { roomid });

    return room;
  }

  async deleteRoom(id: number, user: UserEntity): Promise<void> {
    const result = await this.roomRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new UnauthorizedException(`This room is not yours`);
    }
  }

  async updateRoom(id: number, room: RoomDTO, user: number): Promise<void> {
    const existingRoom = await this.roomRepository.findOne({ where: { id } });
    if (existingRoom.user.id === user) {
      await this.roomRepository.update(id, room);
    } else {
      throw new UnauthorizedException(`This room is not yours`);
    }
  }

  async save(room: RoomDTO): Promise<RoomEntity> {
    return await this.roomRepository.save(room);
  }
}
