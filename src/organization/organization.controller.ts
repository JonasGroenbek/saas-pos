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
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('/:id')
  @UseGuards(PolicyGuard)
  @UseGuards(JwtGuard)
  @RequestPolicy(Policy.OrganizationGetById)
  async getById(
    @RequestIdentity() identity: Identity,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    return await this.organizationService.organizationRepository.getOne({
      where: { id },
      identity,
    });
  }
}
