import {
  DataSource,
  DeepPartial,
  QueryBuilder,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
  InsertQueryBuilder,
} from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { Join, JoinType } from '../postgres/interfaces';
import {
  BaseRepository,
  SelectConfig,
  CreateConfig,
  UpdateConfig,
  DeleteConfig,
  identityFilter,
  validateIdentityInsert,
} from '../postgres/base-repository';
import 'dotenv/config';
import { Identity } from '../auth/interfaces/identity-token-payload';
import { RelationCountLoader } from 'typeorm/query-builder/relation-count/RelationCountLoader';
import { RelationIdLoader } from 'typeorm/query-builder/relation-id/RelationIdLoader';
import { RawSqlResultsToEntityTransformer } from 'typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer';

export const EXCLUDED_COLUMNS = ['password'];

export enum UserRelation {
  Role = 'role',
  Organization = 'organization',
}

const RELATION_CONFIG: {
  [key in UserRelation]: { path: string; alias: string };
} = {
  role: { path: 'user.role', alias: 'role' },
  organization: {
    path: 'user.organization',
    alias: 'organization',
  },
} as const;

export interface WhereConfig {
  id?: number;
  email?: string;
  password?: string;
}

type Select = SelectConfig<User, WhereConfig, UserRelation>;
type Create = CreateConfig<User>;
type Update = UpdateConfig<User>;
type Delete = DeleteConfig;

@Injectable()
export class UserRepository
  extends Repository<User>
  implements BaseRepository<User, WhereConfig, UserRelation>
{
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  join(
    query: SelectQueryBuilder<User>,
    join: Join<UserRelation>,
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

  private getSelectColumns(
    query: QueryBuilder<User>,
    excludedColumns?: string[],
  ) {
    const EXCLUDED_COLUMNS = excludedColumns ?? ['password'];

    const selectColumns = this.dataSource.manager.connection
      .getMetadata(User)
      .columns.filter(
        (column) => !EXCLUDED_COLUMNS.includes(column.propertyName),
      )
      .map((column) => {
        if (query['@instanceof'].description === 'SelectQueryBuilder') {
          return `${query.alias ? `${query.alias}.` : ''}${
            column.propertyName
          }`;
        }
        return column.propertyName;
      });

    return selectColumns;
  }

  async getById(
    id: number,
    identity: Identity | null,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    return await this.createSelectQuery({
      where: { id },
      identity,
      queryRunner,
    }).getOne();
  }

  async getByAuth(email: string): Promise<User> {
    return await this.createSelectQuery({
      where: { email },
      identity: null,
      joins: [
        { relation: UserRelation.Organization, type: JoinType.Inner },
        { relation: UserRelation.Role, type: JoinType.Inner },
      ],
      excludeColumns: [],
    }).getOne();
  }

  async getByEmail(email: string, identity: Identity | null): Promise<User> {
    return await this.createSelectQuery({
      where: { email },
      identity,
    }).getOne();
  }

  async getCount(queryConfig: Select): Promise<number> {
    return this.createSelectQuery(queryConfig).getCount();
  }

  async getOne(queryConfig: Select): Promise<User> {
    return this.createSelectQuery(queryConfig).getOne();
  }

  async getMany(queryConfig: Select): Promise<User[]> {
    return this.createSelectQuery(queryConfig).getMany();
  }

  async getManyWithCount(
    queryConfig: Select,
  ): Promise<{ entities: User[]; count: number }> {
    const [entities, count] = await this.createSelectQuery(
      queryConfig,
    ).getManyAndCount();
    return {
      entities,
      count,
    };
  }

  async insertOne(queryConfig: Create): Promise<User> {
    validateIdentityInsert(queryConfig);
    const result = await this.createInsertQuery(queryConfig).execute();
    return this.create(result.raw[0] as DeepPartial<User>);
  }

  async softDeleteOne(queryConfig: Delete): Promise<User> {
    const result = await this.createSoftDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete user', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<User>);
  }

  async deleteOne(queryConfig: Delete): Promise<User> {
    const result = await this.createDeleteQuery(queryConfig).execute();
    if (!result.affected) {
      throw new HttpException('Could not delete user', HttpStatus.CONFLICT);
    }
    return this.create(result.raw[0] as DeepPartial<User>);
  }

  async updateOne(queryConfig: Update): Promise<User> {
    const query = this.createUpdateQuery(queryConfig);
    const result = await query.execute();

    if (!result.affected) {
      throw new HttpException('Could not update user', HttpStatus.CONFLICT);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    const relationIdLoader = new RelationIdLoader(
      this.dataSource.manager.connection,
      queryRunner,
      query.expressionMap.relationIdAttributes,
    );
    const rawResults = await this.dataSource.query(
      `select * from "user" limit 1;`,
    );
    const relationCountLoader = new RelationCountLoader(
      this.dataSource.manager.connection,
      queryRunner,
      query.expressionMap.relationCountAttributes,
    );
    //console.log('relationCountLoader', relationCountLoader);
    console.log('result.raw', rawResults);

    const rawRelationIdResults = await relationIdLoader.load(rawResults);
    console.log('rawRelationIdResults', rawRelationIdResults);
    const rawRelationCountResults = await relationCountLoader.load(rawResults);
    console.log('rawRelationCountResults', rawRelationCountResults);
    const transformer = new RawSqlResultsToEntityTransformer(
      query.expressionMap,
      this.dataSource.driver,
      rawRelationIdResults,
      rawRelationCountResults,
    );

    console.log('result', rawResults);
    const entities = transformer.transform(
      rawResults,
      query.expressionMap.mainAlias,
    );
    console.log('mergeIntoEntity', entities);
    return entities[0] as User;
  }

  private createInsertQuery(queryConfig: Create): InsertQueryBuilder<User> {
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

    query.values({ ...entity, createdAt: new Date(), updatedAt: new Date() });
    query.returning('*');

    return query;
  }

  private createUpdateQuery(queryConfig: Update): UpdateQueryBuilder<User> {
    let query: UpdateQueryBuilder<User>;
    const { id, values, queryRunner } = queryConfig;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder()
        .update();
    } else {
      query = this.createQueryBuilder().update();
    }

    query.set({ ...values, updatedAt: new Date() });

    identityFilter(query, queryConfig.identity);

    if (id) {
      query.andWhere(`id = :id`, { id });
    }

    query.returning(this.getSelectColumns(query));

    return query;
  }

  private createSoftDeleteQuery(
    queryConfig: Delete,
  ): SoftDeleteQueryBuilder<User> {
    let query: SoftDeleteQueryBuilder<User>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder()
        .softDelete();
    } else {
      query = this.createQueryBuilder().softDelete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    return query;
  }

  private createDeleteQuery(queryConfig: Delete): DeleteQueryBuilder<User> {
    let query: DeleteQueryBuilder<User>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder()
        .delete();
    } else {
      this.dataSource.manager.connection.getMetadata(User);
      query = this.createQueryBuilder().delete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning(this.getSelectColumns(query));

    return query;
  }

  private createSelectQuery(queryConfig: Select): SelectQueryBuilder<User> {
    let query: SelectQueryBuilder<User>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('user');
    } else {
      query = this.createQueryBuilder('user');
    }

    query.select(this.getSelectColumns(query, queryConfig.excludeColumns));

    identityFilter(query, queryConfig.identity);

    if (queryConfig.joins) {
      for (const join of queryConfig.joins) {
        this.join(query, join, queryConfig.identity);
      }
    }

    if (queryConfig.where) {
      const { email, id, password } = queryConfig.where;

      if (email !== undefined) {
        query.andWhere(`user.email = :email`, { email });
      }

      if (password !== undefined) {
        query.andWhere('user.password = :password', { password });
      }

      if (id !== undefined) {
        query.andWhere('user.id = :id', { id });
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
