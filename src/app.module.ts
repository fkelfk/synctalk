import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './config/orm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { RoomsModule } from './rooms/rooms.module';
import { ChatModule } from './chat/chat.module';
import config from './config/config';
// import {
//   WsEmitterClientOptions,
//   WsEmitterModule,
// } from './chat/ws.emitter.module';
import {
  ClusterModule,
  ClusterModuleOptions,
  RedisModule,
  RedisModuleOptions,
} from '@liaoliaots/nestjs-redis';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    ClusterModule.forRoot({
      readyLog: true,
      config: {
        nodes: [
          { host: 'localhost', port: 7001 },
          { host: 'localhost', port: 7002 },
          { host: 'localhost', port: 7003 },
        ],
      },
    }),
    
    // ClusterModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (
    //     configService: ConfigService,
    //   ): Promise<ClusterModuleOptions> => {
    //     return {
    //       config: {
    //         nodes: [
    //           { host: 'localhost', port: 7001 },
    //           { host: 'localhost', port: 7002 },
    //           { host: 'localhost', port: 7003 },
    //         ],
    //         scaleReads: 'slave'
    //       },
    //     };
    //   },
    // }),
    // WsEmitterModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (
    //     configService: ConfigService,
    //   ): Promise<WsEmitterClientOptions> => {
    //     return {
    //       config: {
    //         host: 'localhost',
    //         port: 7001,
    //       },
    //     };
    //   },
    // }),
    // CacheModule,
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
