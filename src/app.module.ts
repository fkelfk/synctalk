import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './auth/entitiy/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'aleh',
      database: 'downbit',
      entities: [UserEntity],
      synchronize: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// @Module({
//   imports: [
//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: 'localhost',
//       port: 5432,
//       username: 'postgres',
//       password: 'aleh',
//       database: 'downbit',
//       // entities: ['src/**/*.entity.{ts,js}'],
//       entities: [UserEntity],
//       migrations: ['src/migrations/**/*.{ts,js}'],
//       cli: {
//         entitiesDir: 'src/modules',
//         migrationsDir: 'src/migrations',
//       },
//       synchronize: true,
//     }),
//     AuthModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
