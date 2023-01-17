import { ClusterService } from '@liaoliaots/nestjs-redis';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Cluster } from 'ioredis';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  // private readonly cluster: Cluster;
  // constructor(private readonly clusterService: ClusterService) {
  //   this.cluster = this.clusterService.getClient();
  // }

  // async get(key: string) {
  //   console.log('----------------------------');
  //   this.cluster.set('ji', 'hi');
  //   console.log('----------------------------');
  //   const get = this.cluster.get('poo');
  //   console.log(get);
  // }

  // async set(key: string, value: string, expire?: number): Promise<'OK'> {
  //   console.log('key', key);
  //   console.log('value', value);
  //   console.log('this', this);
  //   console.log('----------------------------');
  //   console.log('cluster', this.cluster);
  //   console.log('set', await this.cluster.set(key, value, 'EX', 10));
  //   return await this.cluster.set(key, value, 'EX', 10);
  // }

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // private chatGateway: ChatGateway,
  ) {}
  // async setCache(key: string, value: string) {
  //   await this.cacheManager.set(key, value, 1000);
  // }
  // async getCache(key: string) {
  //   const result = await this.cacheManager.get(key);
  // }
  async getCache() {
    const savedTime = await this.cacheManager.get<number>('test8');
    if (savedTime) {
      return 'saved time : ' + savedTime;
    }
    const now = new Date().getTime();
    await this.cacheManager.set('test8', now);
  }
}
