import { DataSource, QueryRunner } from 'typeorm';

export const transaction = async (
  datasource: DataSource,
  callback: (queryRunner: QueryRunner) => any,
) => {
  const queryRunner = datasource.createQueryRunner();
  try {
    await queryRunner.startTransaction();
    const result = await callback(queryRunner);
    await queryRunner.commitTransaction();

    return result;
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  } finally {
    await queryRunner.release();
  }
};
