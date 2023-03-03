import {
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as _BaseEntity,
} from 'typeorm';

export class BaseEntity extends _BaseEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt: Date;
}
