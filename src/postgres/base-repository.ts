import { Identity } from 'src/auth/interfaces/identity-token-payload';
import { QueryRunner, SelectQueryBuilder } from 'typeorm';
import { Join } from './interfaces';

export interface BaseRepository<T> {
  getOne(selectConfig: any): Promise<T>;
  getMany(selectConfig: any): Promise<Array<T>>;
  getManyWithCount(
    selectConfig: any,
  ): Promise<{ entities: Array<T>; count: number }>;
  insertOne(insertConfig: any): Promise<T>;
  deleteOne(deleteConfig: any): Promise<T>;
  updateOne(updateConfig: any): Promise<T>;
  softDeleteOne(deleteConfig: any): Promise<T>;
  insertMany?(insertConfig: any): Promise<Array<T>>;
  deleteMany?(deleteConfig: any): Promise<Array<T>>;
  updateMany?(updateConfig: any): Promise<Array<T>>;
}

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
  queryRunner?: QueryRunner;
}

export interface UpdateConfig<E> {
  id: number;
  values: Omit<Partial<E>, 'id'>;
  identity: Identity | null;
  queryRunner?: QueryRunner;
}

export interface DeleteConfig {
  id: number;
  identity: Identity | null;
  queryRunner?: QueryRunner;
}
