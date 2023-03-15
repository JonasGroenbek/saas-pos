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
import { Product } from './product.entity';
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

export enum ProductRelation {
  Orderline = 'orderline',
}

const RELATION_CONFIG: {
  [key in ProductRelation]: { path: string; alias: string };
} = {
  orderline: { path: 'product.orderline', alias: 'orderline' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

type Select = SelectConfig<Product, WhereConfig, ProductRelation>;
type Create = CreateConfig<Product>;
type Update = UpdateConfig<Product>;
type Delete = DeleteConfig;

@Injectable()
export class ProductRepository
  extends Repository<Product>
  implements BaseRepository<Product, WhereConfig, ProductRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<Product> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<Product[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: Product[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<Product>,
    join: Join<ProductRelation>,
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

  async insertOne(queryConfig: Create): Promise<Product> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Product>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<Product> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete product', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Product>);
  }

  async deleteOne(queryConfig: Delete): Promise<Product> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete product', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Product>);
  }

  async updateOne(queryConfig: Update): Promise<Product> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException('Could not update product', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Product>);
  }

  private createInsertQuery(queryConfig: Create): InsertQueryBuilder<Product> {
    let query: InsertQueryBuilder<Product>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Product)
        .createQueryBuilder('product')
        .insert();
    } else {
      query = this.createQueryBuilder('product').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(queryConfig: Update): UpdateQueryBuilder<Product> {
    let query: UpdateQueryBuilder<Product>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Product)
        .createQueryBuilder('product')
        .update();
    } else {
      query = this.createQueryBuilder('product').update();
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
  ): SoftDeleteQueryBuilder<Product> {
    let query: SoftDeleteQueryBuilder<Product>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Product)
        .createQueryBuilder('product')
        .softDelete();
    } else {
      query = this.createQueryBuilder('product').softDelete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(queryConfig: Delete): DeleteQueryBuilder<Product> {
    let query: DeleteQueryBuilder<Product>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Product)
        .createQueryBuilder('product')
        .delete();
    } else {
      query = this.createQueryBuilder('product').delete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(queryConfig: Select): SelectQueryBuilder<Product> {
    let query: SelectQueryBuilder<Product>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Product)
        .createQueryBuilder('product')
        .select();
    } else {
      query = this.createQueryBuilder('product').select();
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
        query.andWhere('product.id = :id', { id });
      }

      if (organizationId !== undefined) {
        query.andWhere('product.organizationId = :organizationId', {
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
