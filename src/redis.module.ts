import { DynamicModule, FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import IORedis, { ClusterOptions, Cluster } from 'ioredis';
import { ClusterNodes } from './type';

export const IORedisKey = 'IORedis';

type ClusterModuleOptions = {
  nodes: ClusterNodes[];
  connectionOptions: ClusterOptions;
  onClientReady?: (client: Cluster) => void;
};

type ClusterAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<ClusterModuleOptions> | ClusterModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
export class ClusterModule {
  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: ClusterAsyncModuleOptions): Promise<DynamicModule> {
    const redisProvider = {
      provide: IORedisKey,
      useFactory: async (...args) => {
        const { nodes, connectionOptions, onClientReady } = await useFactory(
          ...args,
        );

        const client = new IORedis.Cluster(nodes, connectionOptions);
        

        onClientReady(client);

        return client;
      },
      inject,
    };

    return {
      module: ClusterModule,
      imports: imports,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
