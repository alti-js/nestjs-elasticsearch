import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { IOpenSearchConfig } from '../../models/dtos/config.dto';
import { IField } from '../../models/dtos/field.dto';
import { BaseDocument } from '../../models/core/base-index.model';
import { getIndexName } from '../../helpers/index-name.helper';

export interface IndexConfig {
  name: string;
  types: {
    name: string;
    fields: IField[];
  }[];
}

@Injectable()
export class OpenSearchIndexManagerService {
  private readonly client: Client;
  private readonly logger = new Logger(OpenSearchIndexManagerService.name);

  constructor(
    @Inject('OPENSEARCH_CONFIG') private readonly options: IOpenSearchConfig,
  ) {
    this.client = new Client({
      node: `${this.options.node}:${this.options.port}`,
      auth: {
        username: this.options.auth.username,
        password: this.options.auth.password,
      },
    });
  }

  async initialize(): Promise<void> {
    try {
      let settings: {
        [ty: string]: {
          [key: string]: { type: 'text' | 'number' };
        };
      } = {};
      const {
        body: { version },
      } = await this.client.info();
      if (this.options.models) {
        const models: (new <T extends BaseDocument<any>>(
          client: Client,
        ) => T)[] = this.options.models;
        for (const model of models) {
          const metadata = model.prototype;
          model.prototype.client = this.client;
          model.prototype.version = version.number;
          model.prototype.logger = new Logger(model.name);
          const indexName = getIndexName(
            this.options.index,
            metadata.__type,
            version.number,
          );
          model.prototype.__indexName = indexName;
          if (metadata.__type) {
            if (!settings.hasOwnProperty(metadata.__type)) {
              settings = { ...settings, [metadata.__type]: {} };
            }
            if (metadata.__fields) {
              let fields: IField[] = [];
              Object.keys(metadata.__fields).forEach((f) => {
                fields = [
                  ...fields,
                  { fieldName: f, ...(metadata.__fields[f] as IField) },
                ];
              });
              await this.createIndex(indexName, metadata.__type, fields);
            }
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async createIndex(
    indexName: string,
    type: string,
    fields: IField[],
  ): Promise<any> {
    try {
      let fieldsList = {};
      fields.forEach(({ defaultValue, fieldName, ...config }: IField) => {
        fieldsList = { ...fieldsList, [fieldName]: config };
      });
      const existsStatus = await this.client.indices.exists({
        index: indexName,
      });
      let index: any;
      if (!existsStatus || existsStatus.statusCode !== 200) {
        index = await this.client.indices.create({
          index: indexName,
          body: {
            settings: {
              number_of_shards: 1,
            },
          },
        });
        this.logger.log(`OpenSearch Index created: ${indexName}`);
      } else {
        index = await this.client.indices.get({
          index: indexName,
          expand_wildcards: 'all',
        });
        this.logger.log(`OpenSearch Index exists: ${indexName}`);
      }
      const mappings = index.body[indexName]?.mappings;
      let skipMapping = true;
      const body = {
        properties: fieldsList,
      };
      if (!mappings?.[type]) {
        skipMapping = false;
      }
      if (
        Object.keys(body.properties).some(
          (f) =>
            !mappings?.[type]?.properties?.[f] ||
            body.properties[f].type != mappings?.[type]?.properties?.[f]?.type,
        )
      ) {
        skipMapping = false;
      }
      if (!skipMapping) {
        this.logger.log(`OpenSearch Mapping put: ${indexName}/${type}`);
        index = await this.client.indices.putMapping({
          index: indexName,
          body,
        });
      }
      return index;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
} 