import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Cluster } from 'ioredis';
import { ServerOptions } from 'socket.io';

const pubClient = new Cluster([
  {
    host: 'localhost',
    port: 7001,
  },
  {
    host: 'localhost',
    port: 7002,
  },
  {
    host: 'localhost',
    port: 7003,
  },
],{scaleReads: 'slave'},);
// console.log(pubClient.options)
// console.log(pubClient)

const subClient = pubClient.duplicate();

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    await Promise.all([pubClient, subClient]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
