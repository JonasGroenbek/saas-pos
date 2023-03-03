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
import { Transaction } from './transaction.entity';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import 'dotenv/config';
import { Join, JoinType } from '../postgres/interfaces';
import { BaseRepository } from '../postgres/base-repository';

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

export interface SelectConfig {
  extensions?: Array<(qb: SelectQueryBuilder<Transaction>) => void>;
  where?: WhereConfig;
  joins?: Array<Join<TransactionRelation>>;
  limit?: number;
  offset?: number;
  queryRunner?: QueryRunner;
}

export interface CreateConfig {
  entity: Omit<Partial<Transaction>, 'createdAt' | 'updatedAt'>;
  queryRunner?: QueryRunner;
}

export interface UpdateConfig {
  id: number;
  values: Omit<Partial<Transaction>, 'id'>;
  queryRunner?: QueryRunner;
}

export interface DeleteConfig {
  id: number;
  queryRunner?: QueryRunner;
}

@Injectable()
export class TransactionRepository
  extends Repository<Transaction>
  implements BaseRepository<Transaction>
{
  constructor(private readonly dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async getById(id: number, queryRunner?: QueryRunner): Promise<Transaction> {
    return await this.createSelectQuery({
      where: { id },
      queryRunner,
    }).getOne();
  }

  async getCount(queryConfig: SelectConfig): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: SelectConfig): Promise<Transaction> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: SelectConfig): Promise<Transaction[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: SelectConfig,
  ): Promise<{ entities: Transaction[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  private join(
    query: SelectQueryBuilder<Transaction>,
    join: Join<TransactionRelation>,
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

  async insertOne(queryConfig: CreateConfig): Promise<Transaction> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Transaction>);
  }

  async softDeleteOne(queryConfig: DeleteConfig): Promise<Transaction> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete transaction',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Transaction>);
  }

  async deleteOne(queryConfig: DeleteConfig): Promise<Transaction> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException(
        'Could not delete transaction',
        HttpStatus.CONFLICT,
      );
    }
    return this.create(result.raw[0] as DeepPartial<Transaction>);
  }

  async updateOne(queryConfig: UpdateConfig): Promise<Transaction> {
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
    queryConfig: CreateConfig,
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
    queryConfig: UpdateConfig,
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

    query.set({ ...values, updatedAt: new Date() });

    query.returning('*');

    if (id) {
      query.andWhere(`id = :id`, { id });
    }

    return query;
  }

  private createSoftDeleteQuery(
    queryConfig: DeleteConfig,
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

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(
    queryConfig: DeleteConfig,
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

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(
    queryConfig: SelectConfig,
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

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join);
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
