import { Organization } from '../organization/organization.entity';
import { BaseEntity } from '../postgres/base.entity';
import { Role } from '../role/role.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'email', nullable: false })
  email: string;

  @Column({ type: 'varchar', name: 'first_name', nullable: false })
  firstName: string;

  @Column({ type: 'varchar', name: 'last_name', nullable: false })
  lastName: string;

  @Column({ type: 'varchar', name: 'password', nullable: false })
  password: string;

  @Column({ name: 'organization_id', type: 'int', nullable: true })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

  @Column({ name: 'role_id', type: 'int', nullable: false })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Role;
}
