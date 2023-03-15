import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from './shop.entity';
import { ShopRepository } from './shop.repository';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    public readonly shopRepository: ShopRepository,
  ) {}
}
