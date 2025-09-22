import { IAuthConfigOptions, SearchEngineType } from './config.dto';

export type Region = string;

export interface IClusterConfig {
  node: string;
  port: string;
  auth: IAuthConfigOptions;
  index?: string;
  models?: (new (...args: unknown[]) => unknown)[];
}

export interface IMultiRegionOpenSearchConfig {
  engine: 'opensearch';
  regions: {
    [regionName: string]: IClusterConfig;
  };
  defaultRegion?: string;
  indexPrefix?: string;
  models?: (new (...args: unknown[]) => unknown)[];
}

export interface IMultiRegionElasticSearchConfig {
  engine: 'elasticsearch';
  regions: {
    [regionName: string]: IClusterConfig;
  };
  defaultRegion?: string;
  indexPrefix?: string;
  models?: (new (...args: unknown[]) => unknown)[];
}

export type MultiRegionSearchConfig = IMultiRegionOpenSearchConfig | IMultiRegionElasticSearchConfig;

export interface IRegionRequest {
  region: string;
  [key: string]: unknown;
} 