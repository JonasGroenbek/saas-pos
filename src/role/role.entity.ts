import { Organization } from '../organization/organization.entity';
import { BaseEntity } from '../postgres/base.entity';
import { User } from '../user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Policy } from '../enums/policy.enum';

@Entity({ name: 'role' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @ManyToOne(() => Organization, (organization) => organization.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;

  @Column({ name: 'organization_id', type: 'int', nullable: false })
  organizationId: number;

  @Column({
    type: 'enum',
    enum: Policy,
    array: true,
    default: [],
  })
  policies: Policy[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
