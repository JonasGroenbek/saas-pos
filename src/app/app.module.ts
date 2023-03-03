import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import typeormConfig from '../postgres/typeorm.config';
import { OrganizationModule } from '../organization/organization.module';
import { ShopModule } from '../shop/shop.module';
import { OrderlineModule } from '../orderline/orderline.module';
import { ProductModule } from '../product/product.module';
import { ProductGroupModule } from '../product-group/product-group.module';
import { RoleModule } from '../role/role.module';
import { SaleModule } from '../sale/sale.module';
import { StockLevelModule } from '../stock-level/stock-level.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    AuthModule,
    OrderlineModule,
    OrganizationModule,
    ProductModule,
    ProductGroupModule,
    RoleModule,
    SaleModule,
    ShopModule,
    StockLevelModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [registerAs('postgres', (): TypeOrmModule => typeormConfig)],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<'postgres'>('postgres.type'),
        host: configService.get<string>('postgres.host'),
        port: configService.get<number>('postgres.port'),
        database: configService.get<string>('postgres.database'),
        username: configService.get<string>('postgres.username'),
        password: configService.get<string>('postgres.password'),
        entities: configService.get<string[]>('postgres.entities'),
        logging: configService.get<boolean>('postgres.logging'),
        synchronize: configService.get<boolean>('postgres.synchronize'),
        autoLoadEntities: configService.get<boolean>(
          'postgres.autoLoadEntitites',
        ),
        ssl: configService.get<boolean>('postgres.ssl'),
        extra: configService.get<boolean>('postgres.extra'),
      }),
    }),
  ],
  providers: [],
})
export class AppModule {}
