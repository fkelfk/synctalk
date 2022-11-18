import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from '../domain/user.entity';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './security/passport.jwt.strategy';
import { TypeOrmExModule } from 'src/typeorm-ex.module';
import { UserRepository } from './user.repository';
import { UserAuthority } from '../domain/user-authority.entity';
import { UserAuthorityRepository } from './repository/user-autority.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserAuthority]),
    TypeOrmExModule.forCustomRepository([
      UserRepository,
      UserAuthorityRepository,
    ]),
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '3000s' },
    }),
    PassportModule,
  ],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule {}
