import {
  DataSource,
  DeepPartial,
  DeleteQueryBuilder,
  InsertQueryBuilder,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Organization } from './organization.entity';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import 'dotenv/config';
import { Join, JoinType } from '../postgres/interfaces';
import {
  BaseRepository,
  CreateConfig,
  DeleteConfig,
  identityFilter,
  SelectConfig,
  UpdateConfig,
} from '../postgres/base-repository';
import { Identity } from '../auth/interfaces/identity-token-payload';

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

type Select = SelectConfig<Organization, WhereConfig, OrganizationRelation>;
type Create = CreateConfig<Organization>;
type Update = UpdateConfig<Organization>;
type Delete = DeleteConfig;

@Injectable()
export class OrganizationRepository
  extends Repository<Organization>
  implements BaseRepository<Organization, WhereConfig, OrganizationRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<Organization> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<Organization[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: Organization[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<Organization>,
    join: Join<OrganizationRelation>,
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

  async insertOne(queryConfig: Create): Promise<Organization> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Organization>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<Organization> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete organization',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Organization>);
  }

  async deleteOne(queryConfig: Delete): Promise<Organization> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete organization',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Organization>);
  }

  async updateOne(queryConfig: Update): Promise<Organization> {
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
    queryConfig: Create,
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
    queryConfig: Update,
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

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(
    queryConfig: Delete,
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

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(
    queryConfig: Select,
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

    identityFilter(query, queryConfig.identity);

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join, queryConfig.identity);
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
