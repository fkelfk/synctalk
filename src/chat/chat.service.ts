import { ClusterService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Cluster } from 'ioredis';

@Injectable()
export class ChatService {
  private readonly cluster: Cluster;
  constructor(private readonly clusterService: ClusterService) {
    this.cluster = this.clusterService.getClient();
  }

  async get(key: string) {
    console.log('----------------------------')
    await this.cluster.set('poo', 'hi')
    console.log('----------------------------')
    const get = await this.cluster.get('poo');
    console.log(get)
  }

  async set(key: string, value: string, expire?: number): Promise<void> {
    await this.cluster.set(key, value, 'EX', 10000);
  }
}
