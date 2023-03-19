import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Policy } from '../enums/policy.enum';
import { JoinType } from '../postgres/interfaces';
import { transaction } from '../postgres/transaction';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';
import { QueryRunner } from 'typeorm';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { Organization } from './organization.entity';
import {
  OrganizationRelation,
  OrganizationRepository,
} from './organization.repository';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationRepository)
    public organizationRepository: OrganizationRepository,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  async registerOrganization(
    dto: RegisterOrganizationDto,
  ): Promise<Organization> {
    return await transaction(
      this.organizationRepository.manager.connection,
      async (queryRunner: QueryRunner) => {
        const organization = await this.organizationRepository.insertOne({
          entity: { name: dto.organizationName },
          identity: null,
          queryRunner,
        });

        const role = await this.roleService.roleRepository.insertOne({
          entity: {
            name: 'admin',
            organizationId: organization.id,
            policies: [Policy.Admin],
          },
          identity: null,
          queryRunner,
        });

        await this.userService.registerUser({
          userDto: { roleId: role.id, organizationId: organization.id, ...dto },
          identity: null,
          queryRunner,
        });

        const foundOrganization = await this.organizationRepository.getOne({
          where: { id: organization.id },
          joins: [
            { relation: OrganizationRelation.User, type: JoinType.Left },
            { relation: OrganizationRelation.Role, type: JoinType.Left },
          ],
          identity: null,
          queryRunner,
        });

        return foundOrganization;
      },
    );
  }
}
