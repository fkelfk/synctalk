import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClusterModule } from './redis.module';
import { JwtModule } from '@nestjs/jwt';

export const redisModule = ClusterModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisClusterModule');

    const redisNodes = [
      { host: 'REDIS_HOST1', port: 'REDIS_PORT1' },
      { host: 'REDIS_HOST2', port: 'REDIS_PORT2' },
      { host: 'REDIS_HOST3', port: 'REDIS_PORT3' },
    ];
    const natMaps = [
      'NAT_MAP1',
      'NAT_MAP2',
      'NAT_MAP3',
      'NAT_MAP4',
      'NAT_MAP5',
      'NAT_MAP6',
    ];

    const natMap = {};

    natMaps.forEach((map) => {
      natMap[configService.get(map)] = {
        host: configService.get(`REDIS_HOST${natMaps.indexOf(map) + 1}`),
        port: configService.get(`REDIS_PORT${natMaps.indexOf(map) + 1}`),
      };
    });

    return {
      nodes: redisNodes.map((node) => ({
        host: configService.get(node.host),
        port: configService.get(node.port),
      })),
      connectionOptions: {
        scaleReads: 'slave',
        natMap: natMap,
      },
      onClientReady: (client) => {
        logger.log(`Redis Cluster client ${client.status}`);

        client.on('error', (err) => {
          logger.error('Redis Cluster Client Error: ', err);
        });

        client.on('connect', () => {
          logger.log(`Connected to Redis Cluster`);
        });
      },
    };
  },
  inject: [ConfigService],
});

export const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('SECRET_KEY'),
    signOptions: {
      expiresIn: parseInt(configService.get<string>('JWT_DURATION')),
    },
  }),
  inject: [ConfigService],
});
