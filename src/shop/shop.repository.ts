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
import { Shop } from './shop.entity';
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
import { Identity } from '../auth/interfaces/identity-token-payload';

export enum ShopRelation {
  Organization = 'organization',
}

const RELATION_CONFIG: {
  [key in ShopRelation]: { path: string; alias: string };
} = {
  organization: { path: 'shop.organization', alias: 'organization' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

type Select = SelectConfig<Shop, WhereConfig, ShopRelation>;
type Create = CreateConfig<Shop>;
type Update = UpdateConfig<Shop>;
type Delete = DeleteConfig;

@Injectable()
export class ShopRepository
  extends Repository<Shop>
  implements BaseRepository<Shop, WhereConfig, ShopRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(Shop, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<Shop> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<Shop[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: Shop[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<Shop>,
    join: Join<ShopRelation>,
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

  async insertOne(queryConfig: Create): Promise<Shop> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Shop>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<Shop> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete shop', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Shop>);
  }

  async deleteOne(queryConfig: Delete): Promise<Shop> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete shop', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Shop>);
  }

  async updateOne(queryConfig: Update): Promise<Shop> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException('Could not update shop', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Shop>);
  }

  private createInsertQuery(queryConfig: Create): InsertQueryBuilder<Shop> {
    let query: InsertQueryBuilder<Shop>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Shop)
        .createQueryBuilder('shop')
        .insert();
    } else {
      query = this.createQueryBuilder('shop').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(queryConfig: Update): UpdateQueryBuilder<Shop> {
    let query: UpdateQueryBuilder<Shop>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Shop)
        .createQueryBuilder('shop')
        .update();
    } else {
      query = this.createQueryBuilder('shop').update();
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
  ): SoftDeleteQueryBuilder<Shop> {
    let query: SoftDeleteQueryBuilder<Shop>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Shop)
        .createQueryBuilder('shop')
        .softDelete();
    } else {
      query = this.createQueryBuilder('shop').softDelete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(queryConfig: Delete): DeleteQueryBuilder<Shop> {
    let query: DeleteQueryBuilder<Shop>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Shop)
        .createQueryBuilder('shop')
        .delete();
    } else {
      query = this.createQueryBuilder('shop').delete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(queryConfig: Select): SelectQueryBuilder<Shop> {
    let query: SelectQueryBuilder<Shop>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Shop)
        .createQueryBuilder('shop')
        .select();
    } else {
      query = this.createQueryBuilder('shop').select();
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
        query.andWhere('shop.id = :id', { id });
      }

      if (organizationId !== undefined) {
        query.andWhere('shop.organizationId = :organizationId', {
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
