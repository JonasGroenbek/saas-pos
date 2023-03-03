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
