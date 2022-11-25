import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  async getBiance(): Promise<any> {
    const apikey = process.env.BINANCE_APIKEY;
    const apisecret = process.env.BINANCE_SECRET;
    const Binance = require('node-binance-api');
    const binance = new Binance().options({
      APIKEY: apikey,
      APISECRET: apisecret,
      useServerTime: true,
    });

    const usdtPosition = await binance.futuresPositionRisk();

    return usdtPosition;
  }
}
