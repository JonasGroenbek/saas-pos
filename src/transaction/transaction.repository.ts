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
import { Transaction } from './transaction.entity';
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

export enum TransactionRelation {
  Sale = 'sale',
}

const RELATION_CONFIG: {
  [key in TransactionRelation]: { path: string; alias: string };
} = {
  sale: { path: 'transaction.sale', alias: 'sale' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

type Select = SelectConfig<Transaction, WhereConfig, TransactionRelation>;
type Create = CreateConfig<Transaction>;
type Update = UpdateConfig<Transaction>;
type Delete = DeleteConfig;

@Injectable()
export class TransactionRepository
  extends Repository<Transaction>
  implements BaseRepository<Transaction, WhereConfig, TransactionRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<Transaction> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<Transaction[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: Transaction[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  join(
    query: SelectQueryBuilder<Transaction>,
    join: Join<TransactionRelation>,
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

  async insertOne(queryConfig: Create): Promise<Transaction> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Transaction>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<Transaction> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete transaction',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Transaction>);
  }

  async deleteOne(queryConfig: Delete): Promise<Transaction> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete transaction',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Transaction>);
  }

  async updateOne(queryConfig: Update): Promise<Transaction> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException(
        'Could not update transaction',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Transaction>);
  }

  private createInsertQuery(
    queryConfig: Create,
  ): InsertQueryBuilder<Transaction> {
    let query: InsertQueryBuilder<Transaction>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Transaction)
        .createQueryBuilder('transaction')
        .insert();
    } else {
      query = this.createQueryBuilder('transaction').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(
    queryConfig: Update,
  ): UpdateQueryBuilder<Transaction> {
    let query: UpdateQueryBuilder<Transaction>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Transaction)
        .createQueryBuilder('transaction')
        .update();
    } else {
      query = this.createQueryBuilder('transaction').update();
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
  ): SoftDeleteQueryBuilder<Transaction> {
    let query: SoftDeleteQueryBuilder<Transaction>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Transaction)
        .createQueryBuilder('transaction')
        .softDelete();
    } else {
      query = this.createQueryBuilder('transaction').softDelete();
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
  ): DeleteQueryBuilder<Transaction> {
    let query: DeleteQueryBuilder<Transaction>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Transaction)
        .createQueryBuilder('transaction')
        .delete();
    } else {
      query = this.createQueryBuilder('transaction').delete();
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
  ): SelectQueryBuilder<Transaction> {
    let query: SelectQueryBuilder<Transaction>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(Transaction)
        .createQueryBuilder('transaction')
        .select();
    } else {
      query = this.createQueryBuilder('transaction').select();
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
        query.andWhere('transaction.id = :id', { id });
      }
      if (organizationId !== undefined) {
        query.andWhere('transaction.organizationId = :organizationId', {
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
