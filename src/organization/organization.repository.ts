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
import { Organization } from './organization.entity';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import 'dotenv/config';
import { Join, JoinType } from '../postgres/interfaces';
import { BaseRepository } from '../postgres/base-repository';

export enum OrganizationRelation {
  Shop = 'shops',
  User = 'users',
  Role = 'roles',
}

const RELATION_CONFIG: {
  [key in OrganizationRelation]: { path: string; alias: string };
} = {
  shops: { path: 'organization.shops', alias: 'shops' },
  users: { path: 'organization.users', alias: 'users' },
  roles: { path: 'organization.roles', alias: 'roles' },
} as const;

export interface WhereConfig {
  id?: number;
}

export interface SelectConfig {
  extensions?: Array<(qb: SelectQueryBuilder<Organization>) => void>;
  where?: WhereConfig;
  joins?: Array<Join<OrganizationRelation>>;
  limit?: number;
  offset?: number;
  queryRunner?: QueryRunner;
}

export interface CreateConfig {
  entity: Omit<Partial<Organization>, 'createdAt' | 'updatedAt'>;
  queryRunner?: QueryRunner;
}

export interface UpdateConfig {
  id: number;
  values: Omit<Partial<Organization>, 'id'>;
  queryRunner?: QueryRunner;
}

export interface DeleteConfig {
  id: number;
  queryRunner?: QueryRunner;
}

@Injectable()
export class OrganizationRepository
  extends Repository<Organization>
  implements BaseRepository<Organization>
{
  constructor(private readonly dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }

  async getById(id: number, queryRunner?: QueryRunner): Promise<Organization> {
    return await this.createSelectQuery({
      where: { id },
      queryRunner,
    }).getOne();
  }

  async getCount(queryConfig: SelectConfig): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: SelectConfig): Promise<Organization> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: SelectConfig): Promise<Organization[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: SelectConfig,
  ): Promise<{ entities: Organization[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  private join(
    query: SelectQueryBuilder<Organization>,
    join: Join<OrganizationRelation>,
  ) {
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

  async insertOne(queryConfig: CreateConfig): Promise<Organization> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Organization>);
  }

  async softDeleteOne(queryConfig: DeleteConfig): Promise<Organization> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete organization',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Organization>);
  }

  async deleteOne(queryConfig: DeleteConfig): Promise<Organization> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete organization',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Organization>);
  }

  async updateOne(queryConfig: UpdateConfig): Promise<Organization> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException(
        'Could not update organization',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Organization>);
  }

  private createInsertQuery(
    queryConfig: CreateConfig,
  ): InsertQueryBuilder<Organization> {
    let query: InsertQueryBuilder<Organization>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Organization)
        .createQueryBuilder('organization')
        .insert();
    } else {
      query = this.createQueryBuilder('organization').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(
    queryConfig: UpdateConfig,
  ): UpdateQueryBuilder<Organization> {
    let query: UpdateQueryBuilder<Organization>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Organization)
        .createQueryBuilder('organization')
        .update();
    } else {
      query = this.createQueryBuilder('organization').update();
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
  ): SoftDeleteQueryBuilder<Organization> {
    let query: SoftDeleteQueryBuilder<Organization>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Organization)
        .createQueryBuilder('organization')
        .softDelete();
    } else {
      query = this.createQueryBuilder('organization').softDelete();
    }

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(
    queryConfig: DeleteConfig,
  ): DeleteQueryBuilder<Organization> {
    let query: DeleteQueryBuilder<Organization>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Organization)
        .createQueryBuilder('organization')
        .delete();
    } else {
      query = this.createQueryBuilder('organization').delete();
    }

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(
    queryConfig: SelectConfig,
  ): SelectQueryBuilder<Organization> {
    let query: SelectQueryBuilder<Organization>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Organization)
        .createQueryBuilder('organization')
        .select();
    } else {
      query = this.createQueryBuilder('organization').select();
    }

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join);
      }
    }

    if (queryConfig.where) {
      const { id } = queryConfig.where;

      if (id !== undefined) {
        query.where('organization.id = :id', { id });
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
