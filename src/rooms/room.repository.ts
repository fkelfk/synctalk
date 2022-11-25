import { Repository } from 'typeorm';
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { RoomEntity } from 'src/domain/room.entity';

@CustomRepository(RoomEntity)
export class RoomRepository extends Repository<RoomEntity> {}
