import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Payload } from './security/payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../domain/user.entity';
import axios from 'axios';
import * as qs from 'qs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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
    this.convertInAuthorities(userFind);

    const payload: Payload = {
      id: userFind.id,
      username: userFind.username,
      authorities: userFind.authorities,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
  async tokenValidateUser(payload: Payload): Promise<UserDTO | undefined> {
    const userFind = await this.userService.findByFields({
      where: { id: payload.id },
    });
    this.flatAuthorities(userFind);
    return userFind;
  }
  private flatAuthorities(user: any): UserEntity {
    if (user && user.authorities) {
      const authorities: string[] = [];
      user.authorities.forEach((authority) => {
        authorities.push(authority.authorityName);
      });
      user.authorities = authorities;
    }
    return user;
  }
  private convertInAuthorities(user: any): UserEntity {
    if (user && user.authorities) {
      const authorities: any[] = [];
      user.authorities.forEach((authority) => {
        authorities.push({ name: authority.authorityName });
      });
      user.authorities = authorities;
    }
    return user;
  }
  async kakaoLogin(options: { code: string; domain: string }): Promise<any> {
    const { code, domain } = options;
    const kakaoKey = process.env.KAKAO_KEY;
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const body = {
      grant_type: 'authorization_code',
      client_id: kakaoKey,
      redirect_uri: `${domain}/kakao-callback`,
      code,
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    try {
      const response = await axios({
        method: 'POST',
        url: kakaoTokenUrl,
        timeout: 30000,
        headers,
        data: qs.stringify(body),
      });
      const headerUserInfo = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: 'Bearer ' + response.data.access_token,
      };
      const responseUserInfo = await axios({
        method: 'GET',
        url: kakaoUserInfoUrl,
        timeout: 30000,
        headers: headerUserInfo,
      });
      console.log(responseUserInfo);
      if (responseUserInfo.status === 200) {
        return responseUserInfo.data;
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async login(kakao: any): Promise<{ accessToken: string } | undefined> {
    let userFind: UserEntity = await this.userService.findByFields({
      where: { kakaoId: kakao.id },
    });
    if (!userFind) {
      const kakaoUser = new UserEntity();
      kakaoUser.kakaoId = kakao.id;
      kakaoUser.email = kakao.kakao_account.email;
      kakaoUser.name = kakao.kakao_account.name;
      userFind = await this.userService.registerUser(kakaoUser);
    }

    const payload: Payload = {
      id: userFind.id,
      username: userFind.name,
      authorities: userFind.authorities,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
