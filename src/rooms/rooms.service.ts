import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createRoomID, createUserID } from 'ids';
import { RoomEntity } from 'src/domain/room.entity';
import { UserEntity } from 'src/domain/user.entity';
import { Like } from 'typeorm';
import { RoomDTO } from './dto/room.dto';
import { RoomRepository } from './room.repository';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(RoomEntity) private roomRepository: RoomRepository,
  ) {}

  async createRoom(room: RoomDTO, user: UserEntity): Promise<RoomEntity> {
    const roomCode = createRoomID();
    const roominfo = new RoomEntity();
    (roominfo.title = room.title),
      (roominfo.description = room.description),
      (roominfo.roomCode = roomCode),
      (roominfo.user = user);

    return await this.save(roominfo);
  }

  async joinRoom(roomCode: string) {
    const userId = createUserID();
    const room = await this.roomRepository.find({
      where: {
        roomCode: Like(`%${roomCode}%`),
      },
    });
    return {
      room,
      userId,
    };
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

  async paginationCoveringIndex(
    offset?: number,
    limit?: number,
  ): Promise<[RoomEntity[], number]> {
    const coveringIndexQueryBuilder = this.roomRepository
      .createQueryBuilder('cover')
      .select('cover.id')
      .orderBy('cover.id')
      .offset(offset)
      .limit(limit);

    const count = await coveringIndexQueryBuilder.getCount();

    const rooms = await this.roomRepository
      .createQueryBuilder('rooms')
      .innerJoin(
        `(${coveringIndexQueryBuilder.getQuery()})`,
        'cover',
        'rooms.id = cover_id',
      )
      .innerJoinAndSelect('rooms.user', 'user')
      .select(['rooms', 'user'])
      .getMany();

    return [rooms, count];
  }
}
