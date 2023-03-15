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
import {
  BaseRepository,
  CreateConfig,
  DeleteConfig,
  identityFilter,
  SelectConfig,
  UpdateConfig,
} from '../postgres/base-repository';
import 'dotenv/config';
import { Identity } from 'src/auth/interfaces/identity-token-payload';

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

type Select = SelectConfig<Role, WhereConfig, RoleRelation>;
type Create = CreateConfig<Role>;
type Update = UpdateConfig<Role>;
type Delete = DeleteConfig;

@Injectable()
export class RoleRepository
  extends Repository<Role>
  implements BaseRepository<Role, WhereConfig, RoleRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<Role> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<Role[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: Role[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<Role>,
    join: Join<RoleRelation>,
    identity: Identity | null,
  ) {
    if (join.type === JoinType.Inner) {
      query.innerJoinAndSelect(
        RELATION_CONFIG[join.relation].path,
        RELATION_CONFIG[join.relation].alias,
      );
    } else if (join.type === JoinType.Left) {
      query.leftJoinAndSelect(
        RELATION_CONFIG[join.relation].path,
        RELATION_CONFIG[join.relation].alias,
      );
    }

    query.andWhere(
      `${
        RELATION_CONFIG[join.relation].alias
      }.organizationId = :organizationId`,
      { organizationId: identity.organizationId },
    );

    return query;
  }

  async insertOne(queryConfig: Create): Promise<Role> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Role>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<Role> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete role', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Role>);
  }

  async deleteOne(queryConfig: Delete): Promise<Role> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete role', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Role>);
  }

  async updateOne(queryConfig: Update): Promise<Role> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException('Could not update role', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Role>);
  }

  private createInsertQuery(queryConfig: Create): InsertQueryBuilder<Role> {
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

  private createUpdateQuery(queryConfig: Update): UpdateQueryBuilder<Role> {
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

    identityFilter(query, queryConfig.identity);

    query.set({ ...values, updatedAt: new Date() });

    query.returning('*');

    if (id) {
      query.andWhere(`id = :id`, { id });
    }

    return query;
  }

  private createSoftDeleteQuery(
    queryConfig: Delete,
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

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(queryConfig: Delete): DeleteQueryBuilder<Role> {
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

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(queryConfig: Select): SelectQueryBuilder<Role> {
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

    identityFilter(query, queryConfig.identity);

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join, queryConfig.identity);
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
