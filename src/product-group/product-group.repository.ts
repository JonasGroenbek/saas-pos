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
import { ProductGroup } from './product-group.entity';
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

export enum ProductGroupRelation {
  Product = 'product',
}

const RELATION_CONFIG: {
  [key in ProductGroupRelation]: { path: string; alias: string };
} = {
  product: { path: 'productGroup.product', alias: 'product' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

type Select = SelectConfig<ProductGroup, WhereConfig, ProductGroupRelation>;
type Create = CreateConfig<ProductGroup>;
type Update = UpdateConfig<ProductGroup>;
type Delete = DeleteConfig;

@Injectable()
export class ProductGroupRepository
  extends Repository<ProductGroup>
  implements BaseRepository<ProductGroup, WhereConfig, ProductGroupRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(ProductGroup, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<ProductGroup> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<ProductGroup[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: ProductGroup[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<ProductGroup>,
    join: Join<ProductGroupRelation>,
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

  async insertOne(queryConfig: Create): Promise<ProductGroup> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<ProductGroup>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<ProductGroup> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete productGroup',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<ProductGroup>);
  }

  async deleteOne(queryConfig: Delete): Promise<ProductGroup> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete productGroup',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<ProductGroup>);
  }

  async updateOne(queryConfig: Update): Promise<ProductGroup> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException(
        'Could not update productGroup',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<ProductGroup>);
  }

  private createInsertQuery(
    queryConfig: Create,
  ): InsertQueryBuilder<ProductGroup> {
    let query: InsertQueryBuilder<ProductGroup>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(ProductGroup)
        .createQueryBuilder('productGroup')
        .insert();
    } else {
      query = this.createQueryBuilder('productGroup').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(
    queryConfig: Update,
  ): UpdateQueryBuilder<ProductGroup> {
    let query: UpdateQueryBuilder<ProductGroup>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(ProductGroup)
        .createQueryBuilder('productGroup')
        .update();
    } else {
      query = this.createQueryBuilder('productGroup').update();
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
  ): SoftDeleteQueryBuilder<ProductGroup> {
    let query: SoftDeleteQueryBuilder<ProductGroup>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(ProductGroup)
        .createQueryBuilder('productGroup')
        .softDelete();
    } else {
      query = this.createQueryBuilder('productGroup').softDelete();
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
  ): DeleteQueryBuilder<ProductGroup> {
    let query: DeleteQueryBuilder<ProductGroup>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(ProductGroup)
        .createQueryBuilder('productGroup')
        .delete();
    } else {
      query = this.createQueryBuilder('productGroup').delete();
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
  ): SelectQueryBuilder<ProductGroup> {
    let query: SelectQueryBuilder<ProductGroup>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(ProductGroup)
        .createQueryBuilder('productGroup')
        .select();
    } else {
      query = this.createQueryBuilder('productGroup').select();
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
        query.andWhere('productGroup.id = :id', { id });
      }

      if (organizationId !== undefined) {
        query.andWhere('productGroup.organizationId = :organizationId', {
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
