import {
  DataSource,
  DeepPartial,
  DeleteQueryBuilder,
  InsertQueryBuilder,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Role } from './role.entity';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { Join, JoinType } from '../postgres/interfaces';
import { BaseRepository } from '../postgres/base-repository';
import 'dotenv/config';

export enum RoleRelation {
  User = 'user',
}

const RELATION_CONFIG: {
  [key in RoleRelation]: { path: string; alias: string };
} = {
  user: { path: 'role.user', alias: 'user' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

export interface SelectConfig {
  extensions?: Array<(qb: SelectQueryBuilder<Role>) => void>;
  where?: WhereConfig;
  joins?: Array<Join<RoleRelation>>;
  limit?: number;
  offset?: number;
  queryRunner?: QueryRunner;
}

export interface CreateConfig {
  entity: Omit<Partial<Role>, 'createdAt' | 'updatedAt'>;
  queryRunner?: QueryRunner;
}

export interface UpdateConfig {
  id: number;
  values: Omit<Partial<Role>, 'id'>;
  queryRunner?: QueryRunner;
}

export interface DeleteConfig {
  id: number;
  queryRunner?: QueryRunner;
}

@Injectable()
export class RoleRepository
  extends Repository<Role>
  implements BaseRepository<Role>
{
  constructor(private readonly dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async getById(id: number, queryRunner?: QueryRunner): Promise<Role> {
    return await this.createSelectQuery({
      where: { id },
      queryRunner,
    }).getOne();
  }

  async getCount(queryConfig: SelectConfig): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: SelectConfig): Promise<Role> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: SelectConfig): Promise<Role[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: SelectConfig,
  ): Promise<{ entities: Role[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  private join(query: SelectQueryBuilder<Role>, join: Join<RoleRelation>) {
    if (join.type === JoinType.Inner) {
      return query.innerJoinAndSelect(
        RELATION_CONFIG[join.relation].path,
        RELATION_CONFIG[join.relation].alias,
      );
    } else if (join.type === JoinType.Left) {
      return query.leftJoinAndSelect(
        RELATION_CONFIG[join.relation].path,
        RELATION_CONFIG[join.relation].alias,
      );
    }

    return query.leftJoinAndSelect(
      RELATION_CONFIG[join.relation].path,
      RELATION_CONFIG[join.relation].alias,
    );
  }

  async insertOne(queryConfig: CreateConfig): Promise<Role> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Role>);
  }

  async softDeleteOne(queryConfig: DeleteConfig): Promise<Role> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete role', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Role>);
  }

  async deleteOne(queryConfig: DeleteConfig): Promise<Role> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete role', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Role>);
  }

  async updateOne(queryConfig: UpdateConfig): Promise<Role> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException('Could not update role', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Role>);
  }

  private createInsertQuery(
    queryConfig: CreateConfig,
  ): InsertQueryBuilder<Role> {
    let query: InsertQueryBuilder<Role>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Role)
        .createQueryBuilder('role')
        .insert();
    } else {
      query = this.createQueryBuilder('role').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(
    queryConfig: UpdateConfig,
  ): UpdateQueryBuilder<Role> {
    let query: UpdateQueryBuilder<Role>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Role)
        .createQueryBuilder('role')
        .update();
    } else {
      query = this.createQueryBuilder('role').update();
    }

    query.set({ ...values, updatedAt: new Date() });

    query.returning('*');

    if (id) {
      query.andWhere(`id = :id`, { id });
    }

    return query;
  }

  private createSoftDeleteQuery(
    queryConfig: DeleteConfig,
  ): SoftDeleteQueryBuilder<Role> {
    let query: SoftDeleteQueryBuilder<Role>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Role)
        .createQueryBuilder('role')
        .softDelete();
    } else {
      query = this.createQueryBuilder('role').softDelete();
    }

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(
    queryConfig: DeleteConfig,
  ): DeleteQueryBuilder<Role> {
    let query: DeleteQueryBuilder<Role>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Role)
        .createQueryBuilder('role')
        .delete();
    } else {
      query = this.createQueryBuilder('role').delete();
    }

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(
    queryConfig: SelectConfig,
  ): SelectQueryBuilder<Role> {
    let query: SelectQueryBuilder<Role>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Role)
        .createQueryBuilder('role')
        .select();
    } else {
      query = this.createQueryBuilder('role').select();
    }

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join);
      }
    }

    if (queryConfig.where) {
      const { id, organizationId } = queryConfig.where;

      if (id !== undefined) {
        query.andWhere('role.id = :id', { id });
      }

      if (organizationId !== undefined) {
        query.andWhere('role.organizationId = :organizationId', {
          organizationId,
        });
      }
    }

    if (queryConfig.extensions) {
      for (const extension of queryConfig.extensions) {
        extension(query);
      }
    }

    if (queryConfig.offset) {
      query.limit(queryConfig.offset);
    }

    if (queryConfig.limit) {
      query.take(queryConfig.limit);
    }

    return query;
  }
}
