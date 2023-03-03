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
import { BaseRepository } from '../postgres/base-repository';

export enum RoleRelation {
  User = 'user',
}

const RELATION_CONFIG: {
  [key in RoleRelation]: { path: string; alias: string };
} = {
  user: { path: 'sale.user', alias: 'user' },
} as const;

export interface WhereConfig {
  id?: number;
  organizationId?: number;
}

export interface SelectConfig {
  extensions?: Array<(qb: SelectQueryBuilder<Sale>) => void>;
  where?: WhereConfig;
  joins?: Array<Join<RoleRelation>>;
  limit?: number;
  offset?: number;
  queryRunner?: QueryRunner;
}

export interface CreateConfig {
  entity: Omit<Partial<Sale>, 'createdAt' | 'updatedAt'>;
  queryRunner?: QueryRunner;
}

export interface UpdateConfig {
  id: number;
  values: Omit<Partial<Sale>, 'id'>;
  queryRunner?: QueryRunner;
}

export interface DeleteConfig {
  id: number;
  queryRunner?: QueryRunner;
}

@Injectable()
export class SaleRepository
  extends Repository<Sale>
  implements BaseRepository<Sale>
{
  constructor(private readonly dataSource: DataSource) {
    super(Sale, dataSource.createEntityManager());
  }

  async getById(id: number, queryRunner?: QueryRunner): Promise<Sale> {
    return await this.createSelectQuery({
      where: { id },
      queryRunner,
    }).getOne();
  }

  async getCount(queryConfig: SelectConfig): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: SelectConfig): Promise<Sale> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: SelectConfig): Promise<Sale[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: SelectConfig,
  ): Promise<{ entities: Sale[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  private join(query: SelectQueryBuilder<Sale>, join: Join<RoleRelation>) {
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

  async insertOne(queryConfig: CreateConfig): Promise<Sale> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<Sale>);
  }

  async softDeleteOne(queryConfig: DeleteConfig): Promise<Sale> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete sale', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Sale>);
  }

  async deleteOne(queryConfig: DeleteConfig): Promise<Sale> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete sale', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Sale>);
  }

  async updateOne(queryConfig: UpdateConfig): Promise<Sale> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException('Could not update sale', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<Sale>);
  }

  private createInsertQuery(
    queryConfig: CreateConfig,
  ): InsertQueryBuilder<Sale> {
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

  private createUpdateQuery(
    queryConfig: UpdateConfig,
  ): UpdateQueryBuilder<Sale> {
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

    query.set({ ...values, updatedAt: new Date() });

    query.returning('*');

    if (id) {
      query.andWhere(`id = :id`, { id });
    }

    return query;
  }

  private createSoftDeleteQuery(
    queryConfig: DeleteConfig,
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

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createDeleteQuery(
    queryConfig: DeleteConfig,
  ): DeleteQueryBuilder<Sale> {
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

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning('*');

    return query;
  }

  private createSelectQuery(
    queryConfig: SelectConfig,
  ): SelectQueryBuilder<Sale> {
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

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join);
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
