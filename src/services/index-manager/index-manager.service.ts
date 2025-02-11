import { Inject, Injectable, Logger } from '@nestjs/common';
import * as elasticsearch from '@elastic/elasticsearch';
import { IElasticSearchConfig } from '../../models/dtos/config.dto';
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
export class IndexManagerService {
  private readonly esclient: elasticsearch.Client;
  private readonly logger = new Logger(IndexManagerService.name);

  constructor(
    @Inject('ELASTICSEARCH_CONFIG') private readonly options: IElasticSearchConfig,
  ) {
    this.esclient = new elasticsearch.Client({
      node: `${this.options.node}:${this.options.port}`,
      auth: this.options.auth,
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
      } = await this.esclient.info();
      if (this.options.models) {
        const models: (new <T extends BaseDocument<any>>(
          client: elasticsearch.Client,
        ) => T)[] = this.options.models;
        for (const model of models) {
          const metadata = model.prototype;
          model.prototype.client = this.esclient;
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
  ): Promise<elasticsearch.ApiResponse> {
    try {
      let fieldsList = {};
      fields.forEach(({ defaultValue, fieldName, ...config }: IField) => {
        fieldsList = { ...fieldsList, [fieldName]: config };
      });
      const existsStatus = await this.esclient.indices.exists({
        index: indexName,
      });
      let index: elasticsearch.ApiResponse;
      if (!existsStatus || existsStatus.statusCode !== 200) {
        index = await this.esclient.indices.create({
          index: indexName,
          include_type_name: true,
          body: {
            settings: {
              number_of_shards: 1,
            },
          },
        });
        this.logger.log(`Elasticsearch Index created: ${indexName}`);
      } else {
        index = await this.esclient.indices.get({
          index: indexName,
          include_type_name: true,
          expand_wildcards: 'all',
        });
        this.logger.log(`Elasticsearch Index exists: ${indexName}`);
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
        this.logger.log(`Elasticsearch Mapping puted: ${indexName}/${type}`);
        index = await this.esclient.indices.putMapping({
          index: indexName,
          include_type_name: true,
          type,
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
