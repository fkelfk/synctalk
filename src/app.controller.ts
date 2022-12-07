import { Controller, Get, Inject, CACHE_MANAGER, Query } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get("/cache")
  async getCache(@Query('id') id : string ): Promise<string> {
    const savedTime = await this.cacheManager.get(id)
    if( savedTime ){
      return "saved time : " + savedTime
    }
    const now = new Date().getTime()
    await this.cacheManager.set(id,now, 600 );
    return "save new time : " + now
  }
}
