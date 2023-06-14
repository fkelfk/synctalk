import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SocketIOAdapter } from './socket-io.adapter';

const logger: Logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('server.port');
  const whitelist_port = configService.get<string>('WHITELIST_PORT');

  app.use(cookieParser());
  const whitelist = [`http://localhost:${whitelist_port}`];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: '*',
    methods: 'GET,PUT,PATCH,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
