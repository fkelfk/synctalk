import { ClusterService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Cluster } from 'ioredis';

@Injectable()
export class ChatService {
  private cluster: Cluster;
  constructor(private readonly clusterService: ClusterService) {
    this.cluster = this.clusterService.getClient();
  }
  async getCache(key: string) {
    return await this.cluster.get(key);
  }
  async set(key: string, value: string, expire?: number) {
    return await this.cluster.set(key, value, 'EX', 10000);
  }
}
