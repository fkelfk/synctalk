// import { Injectable } from '@nestjs/common';
// import {
//   RedisOptionsFactory,
//   RedisModuleOptions,
// } from '@liaoliaots/nestjs-redis';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class RedisConfigService implements RedisOptionsFactory {
//   constructor(private configService: ConfigService) {}

//   async createRedisOptions(): Promise<RedisModuleOptions> {
//     return {
//       config: {
//         host: '173.17.0.2',
//         port: 7001,
//       },
//     };
//   }
// }