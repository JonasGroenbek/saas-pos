import { DataSource, DataSourceOptions } from 'typeorm';
import config from './typeorm.config';

const datasource = new DataSource(config as DataSourceOptions); // config is one that is defined in datasource.config.ts file
datasource.initialize();
export default datasource;
