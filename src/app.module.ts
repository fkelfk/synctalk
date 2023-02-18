import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './config/orm.config';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { RoomsModule } from './rooms/rooms.module';
import { ChatModule } from './chat/chat.module';
import config from './config/config';
import { ClusterModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    ClusterModule.forRoot({
      readyLog: true,
      errorLog: true,
      config: {
        scaleReads: 'slave',
        nodes: [
          { host: '127.0.0.1', port: 7001 },
          { host: '127.0.0.1', port: 7002 },
          { host: '127.0.0.1', port: 7003 },
        ],
        natMap: {
          '173.17.0.2:7001': {
            host: '127.0.0.1',
            port: 7001,
          },
          '173.17.0.3:7002': {
            host: '127.0.0.1',
            port: 7002,
          },
          '173.17.0.4:7003': {
            host: '127.0.0.1',
            port: 7003,
          },
          '173.17.0.5:7004': {
            host: '127.0.0.1',
            port: 7004,
          },
          '173.17.0.6:7005': {
            host: '127.0.0.1',
            port: 7005,
          },
          '173.17.0.7:7006': {
            host: '127.0.0.1',
            port: 7006,
          },
        },
      },
    }),
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    AuthModule,
    ApiModule,
    RoomsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
