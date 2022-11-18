import { Repository } from 'typeorm';
import { UserAuthority } from '../../domain/user-authority.entity';
import { CustomRepository } from '../../typeorm-ex.decorator';

@CustomRepository(UserAuthority)
export class UserAuthorityRepository extends Repository<UserAuthority> {}
