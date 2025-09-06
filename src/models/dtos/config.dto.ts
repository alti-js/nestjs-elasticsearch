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
  models?: (new (data?: any) => any)[];
  engine?: SearchEngineType;
}

export interface IOpenSearchConfig {
  index: string;
  node: string;
  port: string;
  auth: IAuthConfigOptions;
  models?: (new (data?: any) => any)[];
  engine: 'opensearch';
}

export type SearchConfig = IElasticSearchConfig | IOpenSearchConfig;