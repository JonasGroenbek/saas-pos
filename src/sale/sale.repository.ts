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
import { Sale } from './sale.entity';
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

export enum SaleRelation {
  User = 'user',
}

const RELATION_CONFIG: {
  [key in SaleRelation]: { path: string; alias: string };
} = {
  user: { path: 'sale.user', alias: 'user' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

type Select = SelectConfig<Sale, WhereConfig, SaleRelation>;
type Create = CreateConfig<Sale>;
type Update = UpdateConfig<Sale>;
type Delete = DeleteConfig;

@Injectable()
export class SaleRepository
  extends Repository<Sale>
  implements BaseRepository<Sale, WhereConfig, SaleRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(Sale, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<Sale> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<Sale[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: Sale[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<Sale>,
    join: Join<SaleRelation>,
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

  async insertOne(queryConfig: Create): Promise<Sale> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Sale>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<Sale> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete sale', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Sale>);
  }

  async deleteOne(queryConfig: Delete): Promise<Sale> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete sale', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Sale>);
  }

  async updateOne(queryConfig: Update): Promise<Sale> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException('Could not update sale', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Sale>);
  }

  private createInsertQuery(queryConfig: Create): InsertQueryBuilder<Sale> {
    let query: InsertQueryBuilder<Sale>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Sale)
        .createQueryBuilder('sale')
        .insert();
    } else {
      query = this.createQueryBuilder('sale').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(queryConfig: Update): UpdateQueryBuilder<Sale> {
    let query: UpdateQueryBuilder<Sale>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Sale)
        .createQueryBuilder('sale')
        .update();
    } else {
      query = this.createQueryBuilder('sale').update();
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
  ): SoftDeleteQueryBuilder<Sale> {
    let query: SoftDeleteQueryBuilder<Sale>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Sale)
        .createQueryBuilder('sale')
        .softDelete();
    } else {
      query = this.createQueryBuilder('sale').softDelete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(queryConfig: Delete): DeleteQueryBuilder<Sale> {
    let query: DeleteQueryBuilder<Sale>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Sale)
        .createQueryBuilder('sale')
        .delete();
    } else {
      query = this.createQueryBuilder('sale').delete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(queryConfig: Select): SelectQueryBuilder<Sale> {
    let query: SelectQueryBuilder<Sale>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Sale)
        .createQueryBuilder('sale')
        .select();
    } else {
      query = this.createQueryBuilder('sale').select();
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
        query.andWhere('sale.id = :id', { id });
      }

      if (organizationId !== undefined) {
        query.andWhere('sale.organizationId = :organizationId', {
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
