import { ClusterManager } from '@liaoliaots/nestjs-redis';
import { CacheModule, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [ CacheModule.register({
    store: redisStore,
    host: 'localhost',
    port: '7001',
    ttl: 100000

    // clusterConfig: {
    //   nodes: [
    //     {
    //       port: 7001,
    //       host: 'localhost'
    //     },
    //     {
    //       port: 7002,
    //       host: 'localhost'
    //     },
    //     {
    //       port: 7003,
    //       host: 'localhost'
    //     }
    //   ],
    // },
  })],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
