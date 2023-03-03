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
import { Orderline } from './orderline.entity';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import 'dotenv/config';
import { Join, JoinType } from '../postgres/interfaces';
import { BaseRepository } from '../postgres/base-repository';

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

export interface SelectConfig {
  extensions?: Array<(qb: SelectQueryBuilder<Orderline>) => void>;
  where?: WhereConfig;
  joins?: Array<Join<OrderlineRelation>>;
  limit?: number;
  offset?: number;
  queryRunner?: QueryRunner;
}

export interface CreateConfig {
  entity: Omit<Partial<Orderline>, 'createdAt' | 'updatedAt'>;
  queryRunner?: QueryRunner;
}

export interface UpdateConfig {
  id: number;
  values: Omit<Partial<Orderline>, 'id'>;
  queryRunner?: QueryRunner;
}

export interface DeleteConfig {
  id: number;
  queryRunner?: QueryRunner;
}

@Injectable()
export class OrderlineRepository
  extends Repository<Orderline>
  implements BaseRepository<Orderline>
{
  constructor(private readonly dataSource: DataSource) {
    super(Orderline, dataSource.createEntityManager());
  }

  async getById(id: number, queryRunner?: QueryRunner): Promise<Orderline> {
    return await this.createSelectQuery({
      where: { id },
      queryRunner,
    }).getOne();
  }

  async getCount(queryConfig: SelectConfig): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: SelectConfig): Promise<Orderline> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: SelectConfig): Promise<Orderline[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: SelectConfig,
  ): Promise<{ entities: Orderline[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  private join(
    query: SelectQueryBuilder<Orderline>,
    join: Join<OrderlineRelation>,
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

  async insertOne(queryConfig: CreateConfig): Promise<Orderline> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Orderline>);
  }

  async softDeleteOne(queryConfig: DeleteConfig): Promise<Orderline> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete orderline',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Orderline>);
  }

  async deleteOne(queryConfig: DeleteConfig): Promise<Orderline> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete orderline',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Orderline>);
  }

  async updateOne(queryConfig: UpdateConfig): Promise<Orderline> {
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
    queryConfig: CreateConfig,
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
    queryConfig: UpdateConfig,
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

    query.set({ ...values, updatedAt: new Date() });

    query.returning('*');

    if (id) {
      query.andWhere(`id = :id`, { id });
    }

    return query;
  }

  private createSoftDeleteQuery(
    queryConfig: DeleteConfig,
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

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(
    queryConfig: DeleteConfig,
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

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(
    queryConfig: SelectConfig,
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

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join);
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
