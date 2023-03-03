import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.TEST_POSTGRES_HOST,
    port: +process.env.TEST_POSTGRES_PORT,
    database: process.env.TEST_POSTGRES_DB,
    username: process.env.TEST_POSTGRES_USER,
    password: process.env.TEST_POSTGRES_PASSWORD,
    entities: ['./src/**/*.entity{.ts,.js}'],
    schema: 'public',
    logging: false,
    synchronize: false,
    autoLoadEntities: true,
    migrations: ['./src/postgres/migrations/*{.ts,.js}'],
  };
};

export default getConfig();
