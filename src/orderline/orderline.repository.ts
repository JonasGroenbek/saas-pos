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
import { Orderline } from './orderline.entity';
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
import { Identity } from 'src/auth/interfaces/identity-token-payload';

export enum OrderlineRelation {
  Product = 'product',
}

const RELATION_CONFIG: {
  [key in OrderlineRelation]: { path: string; alias: string };
} = {
  product: { path: 'orderline.product', alias: 'product' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

type Select = SelectConfig<Orderline, WhereConfig, OrderlineRelation>;
type Create = CreateConfig<Orderline>;
type Update = UpdateConfig<Orderline>;
type Delete = DeleteConfig;

@Injectable()
export class OrderlineRepository
  extends Repository<Orderline>
  implements BaseRepository<Orderline, WhereConfig, OrderlineRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(Orderline, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<Orderline> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<Orderline[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: Orderline[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<Orderline>,
    join: Join<OrderlineRelation>,
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

  async insertOne(queryConfig: Create): Promise<Orderline> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Orderline>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<Orderline> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete orderline',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Orderline>);
  }

  async deleteOne(queryConfig: Delete): Promise<Orderline> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete orderline',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Orderline>);
  }

  async updateOne(queryConfig: Update): Promise<Orderline> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException(
        'Could not update orderline',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Orderline>);
  }

  private createInsertQuery(
    queryConfig: Create,
  ): InsertQueryBuilder<Orderline> {
    let query: InsertQueryBuilder<Orderline>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Orderline)
        .createQueryBuilder('orderline')
        .insert();
    } else {
      query = this.createQueryBuilder('orderline').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(
    queryConfig: Update,
  ): UpdateQueryBuilder<Orderline> {
    let query: UpdateQueryBuilder<Orderline>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Orderline)
        .createQueryBuilder('orderline')
        .update();
    } else {
      query = this.createQueryBuilder('orderline').update();
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
  ): SoftDeleteQueryBuilder<Orderline> {
    let query: SoftDeleteQueryBuilder<Orderline>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Orderline)
        .createQueryBuilder('orderline')
        .softDelete();
    } else {
      query = this.createQueryBuilder('orderline').softDelete();
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
  ): DeleteQueryBuilder<Orderline> {
    let query: DeleteQueryBuilder<Orderline>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Orderline)
        .createQueryBuilder('orderline')
        .delete();
    } else {
      query = this.createQueryBuilder('orderline').delete();
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
  ): SelectQueryBuilder<Orderline> {
    let query: SelectQueryBuilder<Orderline>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Orderline)
        .createQueryBuilder('orderline')
        .select();
    } else {
      query = this.createQueryBuilder('orderline').select();
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
        query.andWhere('orderline.id = :id', { id });
      }

      if (organizationId !== undefined) {
        query.andWhere('orderline.organizationId = :organizationId', {
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
