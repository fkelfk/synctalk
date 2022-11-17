import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Payload } from './security/payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from './entitiy/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtServicee: JwtService,
  ) {}

  async registerNewUser(newUser: UserDTO): Promise<UserDTO> {
    let userFind: UserDTO = await this.userService.findByFields({
      where: { username: newUser.username },
    });
    if (userFind) {
      throw new HttpException('Username already used!', HttpStatus.BAD_REQUEST);
    }
    return this.userService.save(newUser);
  }
  async tokenValidateUser(payload: Payload): Promise<UserDTO | undefined> {
    return await this.userService.findByFields({
      where: { id: payload.id },
    });
  }
  async validateUser(
    userDTO: UserDTO,
  ): Promise<{ accessToken: string } | undefined> {
    let userFind: UserEntity = await this.userService.findByFields({
      where: {
        username: userDTO.username,
      },
    });
    const validatePassword = await bcrypt.compare(
      userDTO.password,
      userFind.password,
    );
    if (!userFind || !validatePassword) {
      throw new UnauthorizedException();
    }

    const payload = { id: userFind.id, username: userFind.username };

    return {
      accessToken: this.jwtServicee.sign(payload),
    };
  }
}
