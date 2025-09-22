export interface IAuthConfigOptions {
  username: string;
  password: string;
}

export type SearchEngineType = 'elasticsearch' | 'opensearch';

export interface IElasticSearchConfig {
  index: string;
  node: string;
  port: string;
  auth: IAuthConfigOptions;
  models?: (new (...args: unknown[]) => unknown)[];
  engine?: SearchEngineType;
}

export interface IOpenSearchConfig {
  index: string;
  node: string;
  port: string;
  auth: IAuthConfigOptions;
  models?: (new (...args: unknown[]) => unknown)[];
  engine: 'opensearch';
}

export type SearchConfig = IElasticSearchConfig | IOpenSearchConfig;