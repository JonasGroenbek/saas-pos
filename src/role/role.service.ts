import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleRepository)
    public readonly roleRepository: RoleRepository,
  ) {}

  getById(id: number, queryRunner?: QueryRunner) {
    return this.roleRepository.getById(id, queryRunner);
  }
}
