import { Injectable, Inject, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { IOpenSearchConfig } from '../../models/dtos/config.dto';
import { IField } from '../../models/dtos/field.dto';
import { ISearchService } from '../../models/core/base-search.service';

@Injectable()
export class OpenSearchService implements ISearchService {
  private readonly logger: Logger = new Logger(OpenSearchService.name);
  private readonly config: IOpenSearchConfig;
  private readonly client: Client;

  constructor(
    @Inject('OPENSEARCH_CONFIG') private options: IOpenSearchConfig,
  ) {
    this.config = options;
    this.client = new Client({
      node: `${this.config.node}:${this.config.port}`,
      auth: {
        username: this.config.auth.username,
        password: this.config.auth.password,
      },
    });
  }

  async createIndex(indexName: string, fields: IField[]): Promise<any> {
    try {
      const fieldsList = fields.reduce(
        (obj, item) =>
          Object.assign(obj, { [item.fieldName]: { type: item.type } }),
        {},
      );
      const existsStatus = await this.client.indices.exists({
        index: indexName,
      });

      if (existsStatus && existsStatus.statusCode === 200) {
        return this.client.indices.putMapping({
          index: indexName,
          body: {
            properties: fieldsList,
          },
        });
      } else {
        return this.client.indices.create({
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
        index: { _index: index },
      });
      bulk.push(doc);
    });
    try {
      return this.client.bulk({
        body: bulk,
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
      return this.client.search({ index: index, body });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async updateIndex(
    index: string,
    query: any,
    updatedFields: any,
  ): Promise<any> {
    let preparedUpdatedFields = '';
    for (const property in updatedFields) {
      preparedUpdatedFields += `ctx._source["${property}"] = "${updatedFields[property]}";`;
    }
    try {
      return this.client.updateByQuery({
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
      return this.client.deleteByQuery({
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
      return this.client.reindex({
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