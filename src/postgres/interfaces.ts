export enum JoinType {
  Inner = 'inner',
  Left = 'left',
}

/**
 * Defines a join configuration for a select query, given an enum of relations
 * @export
 * @interface Join
 * @template T
 */
export interface Join<T> {
  relation: T;
  type?: JoinType;
  selects?: string[];
}

/**
 * Given an enum, specifies a configuration for a select query
 * @export
 * @interface Order
 * @template T
 */
export interface Order<T> {
  orderBy: T;
  order: 'ASC' | 'DESC';
}
