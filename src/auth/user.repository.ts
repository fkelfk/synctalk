import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from './entitiy/user.entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {}
