import { Repository } from 'typeorm';
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { UserEntity } from '../domain/user.entity';

@CustomRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {}
