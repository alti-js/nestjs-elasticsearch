import { Injectable, Inject, Logger } from '@nestjs/common';
import * as elasticsearch from '@elastic/elasticsearch';
import { IElasticSearchConfig } from './models/dtos/config.dto';
import { IField } from './models/dtos/field.dto';

@Injectable()
export class ElasticsearchService {
  private readonly logger: Logger = new Logger(ElasticsearchService.name);
  private readonly IElasticSearchConfig: IElasticSearchConfig;
  private readonly esclient: elasticsearch.Client;

  constructor(
    @Inject('ELASTICSEARCH_CONFIG') private options: IElasticSearchConfig,
  ) {
    this.IElasticSearchConfig = options;
    this.esclient = new elasticsearch.Client({
      node: `${this.IElasticSearchConfig.node}:${this.IElasticSearchConfig.port}`,
    });
  }

  async createIndex(indexName: string, fields: IField[]): Promise<any> {
    try {
      const fieldsList = fields.reduce(
        (obj, item) =>
          Object.assign(obj, { [item.fieldName]: { type: item.type } }),
        {},
      );
      const existsStatus = await this.esclient.indices.exists({
        index: indexName,
      });

      if (existsStatus && existsStatus.statusCode === 200) {
        return this.esclient.indices.putMapping({
          index: indexName,
          body: {
            properties: fieldsList,
          },
        });
      } else {
        return this.esclient.indices.create({
          index: indexName,
          body: {
            mappings: {
              properties: fieldsList,
            },
          },
        });
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async bulkInsert(docs: any[], index: string, type: string): Promise<any> {
    const bulk = [];
    docs.forEach((doc) => {
      bulk.push({
        index: { _index: index, _type: type },
      });
      bulk.push(doc);
    });
    try {
      return this.esclient.bulk({
        body: bulk,
        index: index,
        type: type,
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async searchIndex(
    q: string,
    index: string,
    skip: number,
    limit: number,
    queryType: string,
    fields: string[],
  ): Promise<any> {
    const query = this.generateQuery(q, queryType, fields);
    const body = {
      size: limit,
      from: skip,
      query: query,
    };
    try {
      return this.esclient.search({ index: index, body });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async updateIndex(
    index: string,
    query: any,
    updatetedFields: any,
  ): Promise<any> {
    let preparedUpdatedFields = '';
    for (const property in updatetedFields) {
      preparedUpdatedFields += `ctx._source["${property}"] = "${updatetedFields[property]}";`;
    }
    try {
      return this.esclient.updateByQuery({
        index: index,
        refresh: true,
        body: {
          query: query,
          script: {
            lang: 'painless',
            source: preparedUpdatedFields,
          },
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async removeDocumentFromIndex(indexName: string, query: any): Promise<any> {
    try {
      return this.esclient.deleteByQuery({
        index: indexName,
        body: {
          query: query,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async reindex(
    indexFrom: string,
    indexDest: string,
    query: any,
  ): Promise<any> {
    try {
      return this.esclient.reindex({
        refresh: true,
        body: {
          source: {
            index: indexFrom,
            query: query,
          },
          dest: {
            index: indexDest,
          },
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  generateQuery(q: string, queryType: string, fields: string[]) {
    if (queryType === 'SimpleQuery') {
      return {
        multi_match: {
          query: q,
          type: 'phrase',
          fields: fields,
        },
      };
    }
    return {};
  }
}
