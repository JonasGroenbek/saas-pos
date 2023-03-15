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
import { StockLevel } from './stock-level.entity';
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

export enum StockLevelRelation {
  Product = 'product',
}

const RELATION_CONFIG: {
  [key in StockLevelRelation]: { path: string; alias: string };
} = {
  product: { path: 'stockLevel.product', alias: 'product' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

type Select = SelectConfig<StockLevel, WhereConfig, StockLevelRelation>;
type Create = CreateConfig<StockLevel>;
type Update = UpdateConfig<StockLevel>;
type Delete = DeleteConfig;

@Injectable()
export class StockLevelRepository
  extends Repository<StockLevel>
  implements BaseRepository<StockLevel, WhereConfig, StockLevelRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(StockLevel, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<StockLevel> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<StockLevel[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: StockLevel[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<StockLevel>,
    join: Join<StockLevelRelation>,
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

  async insertOne(queryConfig: Create): Promise<StockLevel> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<StockLevel>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<StockLevel> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete stockLevel',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<StockLevel>);
  }

  async deleteOne(queryConfig: Delete): Promise<StockLevel> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete stockLevel',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<StockLevel>);
  }

  async updateOne(queryConfig: Update): Promise<StockLevel> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException(
        'Could not update stockLevel',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<StockLevel>);
  }

  private createInsertQuery(
    queryConfig: Create,
  ): InsertQueryBuilder<StockLevel> {
    let query: InsertQueryBuilder<StockLevel>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(StockLevel)
        .createQueryBuilder('stockLevel')
        .insert();
    } else {
      query = this.createQueryBuilder('stockLevel').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(
    queryConfig: Update,
  ): UpdateQueryBuilder<StockLevel> {
    let query: UpdateQueryBuilder<StockLevel>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(StockLevel)
        .createQueryBuilder('stockLevel')
        .update();
    } else {
      query = this.createQueryBuilder('stockLevel').update();
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
  ): SoftDeleteQueryBuilder<StockLevel> {
    let query: SoftDeleteQueryBuilder<StockLevel>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(StockLevel)
        .createQueryBuilder('stockLevel')
        .softDelete();
    } else {
      query = this.createQueryBuilder('stockLevel').softDelete();
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
  ): DeleteQueryBuilder<StockLevel> {
    let query: DeleteQueryBuilder<StockLevel>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(StockLevel)
        .createQueryBuilder('stockLevel')
        .delete();
    } else {
      query = this.createQueryBuilder('stockLevel').delete();
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
  ): SelectQueryBuilder<StockLevel> {
    let query: SelectQueryBuilder<StockLevel>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(StockLevel)
        .createQueryBuilder('stockLevel')
        .select();
    } else {
      query = this.createQueryBuilder('stockLevel').select();
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
        query.andWhere('stockLevel.id = :id', { id });
      }

      if (organizationId !== undefined) {
        query.andWhere('stockLevel.organizationId = :organizationId', {
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
