import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function ormConfig(): TypeOrmModuleOptions {
  const commonConf = {
    SYNCRONIZE: false,
    ENTITIES: [__dirname + '/../domain/*.entity{.ts,.js}'],
    MIGRATIONS: [__dirname + '/../migrations/**/*{.ts,.js}'],
    MIGRATIONS_RUN: false,
  };

  const ormconfig: TypeOrmModuleOptions = {
    name: 'default',
    type: 'postgres',
    database: 'downbit',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'aleh',
    logging: true,
    synchronize: commonConf.SYNCRONIZE,
    entities: commonConf.ENTITIES,
    migrations: commonConf.MIGRATIONS,
    migrationsRun: commonConf.MIGRATIONS_RUN,
  };

  return ormconfig;
}

export { ormConfig };
