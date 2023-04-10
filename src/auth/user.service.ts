import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Like } from 'typeorm';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from '../domain/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { UserAuthority } from 'src/domain/user-authority.entity';
import { RoleType } from 'src/role-type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: UserRepository,
    @InjectRepository(UserAuthority)
    private userAuthorityRepository: Repository<UserAuthority>,
  ) {}

  async findByFields(
    options: FindOneOptions<UserDTO | UserEntity>,
  ): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne(options);
  }

  async transformPassword(user: UserDTO): Promise<void> {
    user.password = await bcrypt.hash(user.password, 10);
    return Promise.resolve();
  }

  async registerUser(user: UserEntity): Promise<UserEntity> {
    const registeredUser = await this.save(user);
    if (registeredUser) {
      await this.saveAuthority(registeredUser.id);
    } else {
      throw new HttpException(
        'User Register Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return registeredUser;
  }
  async saveAuthority(id: number): Promise<UserAuthority | undefined> {
    let userAuth = new UserAuthority();
    userAuth.userId = id;
    userAuth.authorityName = RoleType.USER;
    return await this.userAuthorityRepository.save(userAuth);
  }

  async save(userDTO: UserDTO): Promise<UserEntity | undefined> {
    if (userDTO.password) await this.transformPassword(userDTO);
    return await this.userRepository.save(userDTO);
  }
} 
