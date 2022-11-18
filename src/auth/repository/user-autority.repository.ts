import { Repository } from 'typeorm';
import { UserAuthority } from '../entitiy/user-authority.entity';
import { CustomRepository } from '../../typeorm-ex.decorator';

@CustomRepository(UserAuthority)
export class UserAuthorityRepository extends Repository<UserAuthority> {}
