import {
  DataSource,
  DeepPartial,
  DeleteQueryBuilder,
  InsertQueryBuilder,
  QueryBuilder,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { Join, JoinType } from '../postgres/interfaces';
import { BaseRepository } from '../postgres/base-repository';
import 'dotenv/config';

export const EXCLUDED_COLUMNS = ['password'];

export enum UserRelation {
  Role = 'role',
  Organization = 'organization',
}

const RELATION_CONFIG: {
  [key in UserRelation]: { path: string; alias: string };
} = {
  role: { path: 'user.role', alias: 'role' },
  organization: { path: 'user.organization', alias: 'organization' },
} as const;

export interface WhereConfig {
  id?: number;
  email?: string;
  password?: string;
  organizationId: number | null;
}

export interface SelectConfig {
  extensions?: Array<(qb: SelectQueryBuilder<User>) => void>;
  select?: string[];
  where?: WhereConfig;
  joins?: Array<Join<UserRelation>>;
  limit?: number;
  offset?: number;
  queryRunner?: QueryRunner;
}

export interface CreateConfig {
  entity: Omit<Partial<User>, 'createdAt' | 'updatedAt'>;
  queryRunner?: QueryRunner;
}

export interface UpdateConfig {
  id: number;
  organizationId: number | null;
  values: Omit<Partial<User>, 'id'>;
  queryRunner?: QueryRunner;
}

export interface DeleteConfig {
  id: number;
  organizationId: number | null;
  queryRunner?: QueryRunner;
}

@Injectable()
export class UserRepository
  extends Repository<User>
  implements BaseRepository<User>
{
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  private getSelectColumns(query?: QueryBuilder<User>) {
    const EXCLUDED_COLUMNS = ['password'];

    return this.dataSource.manager.connection
      .getMetadata(User)
      .columns.filter(
        (column) => !EXCLUDED_COLUMNS.includes(column.propertyName),
      )
      .map(
        (column) =>
          `${query.alias ? `${query.alias}.` : ''}${column.propertyName}`,
      );
  }

  async getById(
    id: number,
    organizationId: number,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    return await this.createSelectQuery({
      where: { id, organizationId },
      queryRunner,
    }).getOne();
  }

  async getByAuth(email: string, password: string): Promise<User> {
    return await this.createSelectQuery({
      where: { email, password, organizationId: null },
      joins: [
        { relation: UserRelation.Organization, type: JoinType.Inner },
        { relation: UserRelation.Role, type: JoinType.Inner },
      ],
    }).getOne();
  }

  async getByEmail(email: string, organizationId: number): Promise<User> {
    return await this.createSelectQuery({
      where: { email, organizationId },
    }).getOne();
  }

  async getCount(queryConfig: SelectConfig): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: SelectConfig): Promise<User> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: SelectConfig): Promise<User[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: SelectConfig,
  ): Promise<{ entities: User[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  private join(query: SelectQueryBuilder<User>, join: Join<UserRelation>) {
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

  async insertOne(queryConfig: CreateConfig): Promise<User> {
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<User>);
  }

  async softDeleteOne(queryConfig: DeleteConfig): Promise<User> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete user', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<User>);
  }

  async deleteOne(queryConfig: DeleteConfig): Promise<User> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete user', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<User>);
  }

  async updateOne(queryConfig: UpdateConfig): Promise<User> {
    const result = await this.createUpdateQuery(queryConfig).execute();

    if (!result.affected) {
      throw new HttpException('Could not update user', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<User>);
  }

  private createInsertQuery(
    queryConfig: CreateConfig,
  ): InsertQueryBuilder<User> {
    let query: InsertQueryBuilder<User>;
    const entity = queryConfig.entity;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('user')
        .insert();
    } else {
      query = this.createQueryBuilder('user').insert();
    }

    query.returning('*');
    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });

    return query;
  }

  private createUpdateQuery(
    queryConfig: UpdateConfig,
  ): UpdateQueryBuilder<User> {
    let query: UpdateQueryBuilder<User>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('user')
        .update();
    } else {
      query = this.createQueryBuilder('user').update();
    }

    query.set({ ...values, updatedAt: new Date() });

    if (id) {
      query.andWhere(`id = :id`, { id });
    }

    query.returning(this.getSelectColumns(query));

    return query;
  }

  private createSoftDeleteQuery(
    queryConfig: DeleteConfig,
  ): SoftDeleteQueryBuilder<User> {
    let query: SoftDeleteQueryBuilder<User>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('user')
        .softDelete();
    } else {
      query = this.createQueryBuilder('user').softDelete();
    }

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning(this.getSelectColumns(query));

    return query;
  }

  private createDeleteQuery(
    queryConfig: DeleteConfig,
  ): DeleteQueryBuilder<User> {
    let query: DeleteQueryBuilder<User>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('user')
        .delete();
    } else {
      this.dataSource.manager.connection.getMetadata(User);
      query = this.createQueryBuilder('user').delete();
    }

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning(this.getSelectColumns(query));

    return query;
  }

  private createSelectQuery(
    queryConfig: SelectConfig,
  ): SelectQueryBuilder<User> {
    let query: SelectQueryBuilder<User>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('user');
    } else {
      query = this.createQueryBuilder('user');
    }

    query.select(queryConfig.select || this.getSelectColumns(query));

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join);
      }
    }

    if (queryConfig.where) {
      const { email, id, organizationId, password } = queryConfig.where;

      if (email !== undefined) {
        query.andWhere(`user.email = :email`, { email });
      }

      if (password !== undefined) {
        query.andWhere('user.password = :password', { password });
      }

      if (id !== undefined) {
        query.andWhere('user.id = :id', { id });
      }

      if (organizationId !== undefined) {
        query.andWhere('user.organizationId = :organizationId', {
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
