import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions } from 'typeorm';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from '../domain/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findByFields(
    options: FindOneOptions<UserDTO | UserEntity>,
  ): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne(options);
  }

  async transformPassword(user: UserDTO): Promise<void> {
    user.password = await bcrypt.hash(user.password, 10);
    return Promise.resolve();
  }
  async save(userDTO: UserDTO): Promise<UserDTO | undefined> {
    await this.transformPassword(userDTO);
    console.log(userDTO);
    return await this.userRepository.save(userDTO);
  }
}
