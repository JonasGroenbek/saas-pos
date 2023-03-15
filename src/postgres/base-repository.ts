import { Identity } from '../auth/interfaces/identity-token-payload';
import { Join } from './interfaces';
import {
  QueryRunner,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { HttpException, HttpStatus } from '@nestjs/common';

export interface SelectConfig<E, W, R> {
  extensions?: Array<(qb: SelectQueryBuilder<E>) => void>;
  excludeColumns?: string[];
  where?: W;
  joins?: Array<Join<R>>;
  limit?: number;
  offset?: number;
  identity: Identity | null;
  queryRunner?: QueryRunner;
}

export interface CreateConfig<E> {
  entity: Omit<Partial<E>, 'createdAt' | 'updatedAt'>;
  identity: Identity | null;
  queryRunner?: QueryRunner;
}

export interface UpdateConfig<E> {
  id: number;
  values: Omit<Partial<E>, 'id' | 'organizationId' | 'organization'>;
  identity: Identity | null;
  queryRunner?: QueryRunner;
}

export interface DeleteConfig {
  id: number;
  identity: Identity | null;
  queryRunner?: QueryRunner;
}

export interface BaseRepository<E, W, R> {
  join(
    query: SelectQueryBuilder<E>,
    join: Join<R>,
    identity: Identity | null,
  ): SelectQueryBuilder<E>;
  getOne(selectConfig: SelectConfig<E, W, R>): Promise<E>;
  getMany(selectConfig: SelectConfig<E, W, R>): Promise<Array<E>>;
  getManyWithCount(
    selectConfig: SelectConfig<E, W, R>,
  ): Promise<{ entities: Array<E>; count: number }>;
  insertOne(insertConfig: CreateConfig<E>): Promise<E>;
  deleteOne(deleteConfig: any): Promise<E>;
  updateOne(updateConfig: UpdateConfig<E>): Promise<E>;
  softDeleteOne(deleteConfig: DeleteConfig): Promise<E>;
  insertMany?(insertConfig: CreateConfig<E>): Promise<Array<E>>;
  deleteMany?(deleteConfig: any): Promise<Array<E>>;
  updateMany?(updateConfig: UpdateConfig<E>): Promise<Array<E>>;
}

export const validateIdentityInsert = <E>(config: CreateConfig<E>) => {
  if (
    config.identity &&
    config.entity['organizationId'] !== config.identity.organizationId
  ) {
    throw new HttpException(
      'Cannot insert an entity, when it does not belong to the organization of provided identity',
      HttpStatus.CONFLICT,
    );
  }
};

export const identityFilter = <T>(
  queryBuilder:
    | SoftDeleteQueryBuilder<T>
    | SelectQueryBuilder<T>
    | UpdateQueryBuilder<T>
    | DeleteQueryBuilder<T>,
  identity: Identity | null,
) => {
  if (!identity) {
    return queryBuilder;
  }

  // when using select queries, the alias is used in the query
  if (queryBuilder['@instanceof'].toString() === 'SelectQueryBuilder') {
    return queryBuilder.andWhere(
      `${queryBuilder.alias}.organizationId = :organizationId`,
      { organizationId: identity.organizationId },
    );
  }

  return queryBuilder.andWhere(`organization_id = :organizationId`, {
    organizationId: identity.organizationId,
  });
};
