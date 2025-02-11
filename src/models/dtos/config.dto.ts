export interface IAuthConfigOptions {
  username: string;
  password: string;
}
export interface IElasticSearchConfig {
  index: string;
  node: string;
  port: string;
  auth: IAuthConfigOptions;
  models?: (new (data?: any) => any)[];
}