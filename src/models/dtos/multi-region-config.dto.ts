import { IAuthConfigOptions, SearchEngineType } from './config.dto';

export type Region = 'singapore' | 'indonesia' | 'australia' | 'thailand';

export interface IClusterConfig {
  node: string;
  port: string;
  auth: IAuthConfigOptions;
  index?: string;
  models?: (new (data?: any) => any)[];
}

export interface IMultiRegionOpenSearchConfig {
  engine: 'opensearch';
  regions: {
    [key in Region]: IClusterConfig;
  };
  defaultRegion?: Region;
  indexPrefix?: string;
  models?: (new (data?: any) => any)[];
}

export interface IMultiRegionElasticSearchConfig {
  engine: 'elasticsearch';
  regions: {
    [key in Region]: IClusterConfig;
  };
  defaultRegion?: Region;
  indexPrefix?: string;
  models?: (new (data?: any) => any)[];
}

export type MultiRegionSearchConfig = IMultiRegionOpenSearchConfig | IMultiRegionElasticSearchConfig;

export interface IRegionRequest {
  region: Region;
  [key: string]: any;
} 