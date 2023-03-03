import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    entities: ['dist/**/*.entity{.ts,.js}'],
    schema: 'public',
    logging: false,
    synchronize: false,
    autoLoadEntities: true,
    migrations: ['src/postgres/migrations/*{.ts,.js}'],
  };
};

export default getConfig();
