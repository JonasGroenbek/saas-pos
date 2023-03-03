import { Body, Controller, Post } from '@nestjs/common';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  registerOrganization(@Body() dto: RegisterOrganizationDto) {
    return this.organizationService.registerOrganization(dto);
  }
}
