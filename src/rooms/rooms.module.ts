import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from 'src/domain/room.entity';
import { UserEntity } from 'src/domain/user.entity';
import { TypeOrmExModule } from 'src/typeorm-ex.module';
import { RoomRepository } from './room.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomEntity, UserEntity]),
    TypeOrmExModule.forCustomRepository([
      RoomRepository
    ]),
  ],
  exports: [TypeOrmModule],
  providers: [RoomsService],
  controllers: [RoomsController]
})
export class RoomsModule {}
