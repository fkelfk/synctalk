import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from 'src/domain/room.entity';
import { UserEntity } from 'src/domain/user.entity';
import { TypeOrmExModule } from 'src/typeorm-ex.module';
import { RoomRepository } from './room.repository';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

const databasePoolFactory = async (configService: ConfigService) => {
  return new Pool({
    user: configService.get('POSTGRES_USER'),
    host: configService.get('POSTGRES_HOST'),
    database: configService.get('POSTGRES_DB'),
    port: configService.get('POSTGRES_LOCAL_PORT'),
  });
};

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomEntity, UserEntity]),
    TypeOrmExModule.forCustomRepository([
      RoomRepository
    ]),
  ],
  exports: [TypeOrmModule],
  providers: [RoomsService,{
    provide: 'DATABASE_POOL',
    inject: [ConfigService],
    useFactory: databasePoolFactory,
  },],
  controllers: [RoomsController]
})
export class RoomsModule {}
