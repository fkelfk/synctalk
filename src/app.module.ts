import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './config/orm.config';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { RoomsModule } from './rooms/rooms.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import config from './config/config';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    AuthModule,
    ApiModule,
    RoomsModule,
    CacheModule.register({
      store: redisStore,
      clusterConfig: {
        nodes: [
          {
            port: 7000,
            host: '127.0.0.1',
          },
          {
            port: 7001,
            host: '127.0.0.1',
          },
          {
            port: 7002,
            host: '127.0.0.1',
          },
        ],
      },
    }),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
