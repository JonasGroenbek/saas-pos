import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Identity } from 'src/auth/interfaces/identity-token-payload';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RequestIdentity } from 'src/decorators/request-identity.decorator';
import { RequestPolicy } from 'src/decorators/request-policy.decorator';
import { Policy } from 'src/enums/policy.enum';
import { PolicyGuard } from 'src/guards/policy.guard';
import { ProductGroupService } from './product-group.service';

@Controller()
export class ProductGroupController {
  constructor(private readonly productGroupService: ProductGroupService) {}

  @Get('/:id')
  @UseGuards(PolicyGuard)
  @UseGuards(JwtGuard)
  @RequestPolicy(Policy.ProductGroupGetById)
  async getById(
    @RequestIdentity() identity: Identity,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    return await this.productGroupService.productGroupRepository.getOne({
      where: { id },
      identity,
    });
  }
}
