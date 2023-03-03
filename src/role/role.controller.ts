import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/:id')
  getById(@Param('id', new ParseIntPipe()) id: number) {
    this.roleService.getById(id);
  }
}
