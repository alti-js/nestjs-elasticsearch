import { Injectable, Inject, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { IOpenSearchConfig } from '../../models/dtos/config.dto';
import { IField } from '../../models/dtos/field.dto';
import { IEnhancedSearchService } from '../../models/core/enhanced-search.service';

@Injectable()
export class EnhancedOpenSearchService implements IEnhancedSearchService {
  private readonly logger: Logger = new Logger(EnhancedOpenSearchService.name);
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

  // ===== BASIC CRUD OPERATIONS (existing) =====

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

  // ===== ENHANCED INDEX CRUD OPERATIONS (new) =====

  async deleteIndex(indexName: string): Promise<any> {
    try {
      this.logger.log(`Deleting index: ${indexName}`);
      return await this.client.indices.delete({
        index: indexName,
      });
    } catch (e) {
      this.logger.error(`Failed to delete index ${indexName}:`, e);
      throw e;
    }
  }

  async indexExists(indexName: string): Promise<boolean> {
    try {
      const response = await this.client.indices.exists({
        index: indexName,
      });
      return response.statusCode === 200;
    } catch (e) {
      this.logger.error(`Failed to check if index ${indexName} exists:`, e);
      return false;
    }
  }

  async getIndexInfo(indexName: string): Promise<any> {
    try {
      const response = await this.client.indices.get({
        index: indexName,
      });
      return response.body[indexName];
    } catch (e) {
      this.logger.error(`Failed to get index info for ${indexName}:`, e);
      throw e;
    }
  }

  async updateIndexSettings(indexName: string, settings: any): Promise<any> {
    try {
      this.logger.log(`Updating settings for index: ${indexName}`);
      return await this.client.indices.putSettings({
        index: indexName,
        body: settings,
      });
    } catch (e) {
      this.logger.error(`Failed to update settings for index ${indexName}:`, e);
      throw e;
    }
  }

  async getIndexStats(indexName: string): Promise<any> {
    try {
      const response = await this.client.indices.stats({
        index: indexName,
      });
      return response.body.indices[indexName];
    } catch (e) {
      this.logger.error(`Failed to get stats for index ${indexName}:`, e);
      throw e;
    }
  }

  async getIndexHealth(indexName: string): Promise<any> {
    try {
      const response = await this.client.cluster.health({
        index: indexName,
      });
      return response.body;
    } catch (e) {
      this.logger.error(`Failed to get health for index ${indexName}:`, e);
      throw e;
    }
  }

  // ===== INDEX ALIAS OPERATIONS =====

  async createAlias(indexName: string, aliasName: string): Promise<any> {
    try {
      this.logger.log(`Creating alias ${aliasName} for index ${indexName}`);
      return await this.client.indices.putAlias({
        index: indexName,
        name: aliasName,
      });
    } catch (e) {
      this.logger.error(`Failed to create alias ${aliasName}:`, e);
      throw e;
    }
  }

  async deleteAlias(indexName: string, aliasName: string): Promise<any> {
    try {
      this.logger.log(`Deleting alias ${aliasName} from index ${indexName}`);
      return await this.client.indices.deleteAlias({
        index: indexName,
        name: aliasName,
      });
    } catch (e) {
      this.logger.error(`Failed to delete alias ${aliasName}:`, e);
      throw e;
    }
  }

  async getAliases(indexName?: string): Promise<any> {
    try {
      const params = indexName ? { index: indexName } : {};
      const response = await this.client.indices.getAlias(params);
      return response.body;
    } catch (e) {
      this.logger.error('Failed to get aliases:', e);
      throw e;
    }
  }

  // ===== INDEX TEMPLATE OPERATIONS =====

  async createIndexTemplate(templateName: string, template: any): Promise<any> {
    try {
      this.logger.log(`Creating index template: ${templateName}`);
      return await this.client.indices.putTemplate({
        name: templateName,
        body: template,
      });
    } catch (e) {
      this.logger.error(`Failed to create index template ${templateName}:`, e);
      throw e;
    }
  }

  async deleteIndexTemplate(templateName: string): Promise<any> {
    try {
      this.logger.log(`Deleting index template: ${templateName}`);
      return await this.client.indices.deleteTemplate({
        name: templateName,
      });
    } catch (e) {
      this.logger.error(`Failed to delete index template ${templateName}:`, e);
      throw e;
    }
  }

  async getIndexTemplate(templateName: string): Promise<any> {
    try {
      const response = await this.client.indices.getTemplate({
        name: templateName,
      });
      return response.body[templateName];
    } catch (e) {
      this.logger.error(`Failed to get index template ${templateName}:`, e);
      throw e;
    }
  }

  // ===== ADVANCED OPERATIONS =====

  async closeIndex(indexName: string): Promise<any> {
    try {
      this.logger.log(`Closing index: ${indexName}`);
      return await this.client.indices.close({
        index: indexName,
      });
    } catch (e) {
      this.logger.error(`Failed to close index ${indexName}:`, e);
      throw e;
    }
  }

  async openIndex(indexName: string): Promise<any> {
    try {
      this.logger.log(`Opening index: ${indexName}`);
      return await this.client.indices.open({
        index: indexName,
      });
    } catch (e) {
      this.logger.error(`Failed to open index ${indexName}:`, e);
      throw e;
    }
  }

  async refreshIndex(indexName: string): Promise<any> {
    try {
      this.logger.log(`Refreshing index: ${indexName}`);
      return await this.client.indices.refresh({
        index: indexName,
      });
    } catch (e) {
      this.logger.error(`Failed to refresh index ${indexName}:`, e);
      throw e;
    }
  }

  async flushIndex(indexName: string): Promise<any> {
    try {
      this.logger.log(`Flushing index: ${indexName}`);
      return await this.client.indices.flush({
        index: indexName,
      });
    } catch (e) {
      this.logger.error(`Failed to flush index ${indexName}:`, e);
      throw e;
    }
  }

  async forceMergeIndex(indexName: string): Promise<any> {
    try {
      this.logger.log(`Force merging index: ${indexName}`);
      return await this.client.indices.forcemerge({
        index: indexName,
      });
    } catch (e) {
      this.logger.error(`Failed to force merge index ${indexName}:`, e);
      throw e;
    }
  }

  // ===== ADVANCED QUERY METHODS =====

  async searchWithCustomQuery(
    indexName: string,
    query: Record<string, unknown>,
    options?: {
      size?: number;
      from?: number;
      sort?: Array<Record<string, unknown>>;
      _source?: string[] | boolean;
      highlight?: Record<string, unknown>;
      aggregations?: Record<string, unknown>;
    }
  ): Promise<any> {
    try {
      this.logger.log(`Custom search in index: ${indexName}`);
      
      const body: Record<string, unknown> = {
        query,
        ...options,
      };
      
      return await this.client.search({
        index: indexName,
        body,
      });
    } catch (e) {
      this.logger.error(`Failed to execute custom search in index ${indexName}:`, e);
      throw e;
    }
  }

  buildMatchQuery(field: string, value: string | number): Record<string, unknown> {
    return {
      match: {
        [field]: value,
      },
    };
  }

  buildMatchPhraseQuery(field: string, phrase: string): Record<string, unknown> {
    return {
      match_phrase: {
        [field]: phrase,
      },
    };
  }

  buildTermQuery(field: string, value: string | number | boolean): Record<string, unknown> {
    return {
      term: {
        [field]: value,
      },
    };
  }

  buildTermsQuery(field: string, values: Array<string | number>): Record<string, unknown> {
    return {
      terms: {
        [field]: values,
      },
    };
  }

  buildRangeQuery(
    field: string,
    options: {
      gte?: number | string;
      gt?: number | string;
      lte?: number | string;
      lt?: number | string;
    }
  ): Record<string, unknown> {
    return {
      range: {
        [field]: options,
      },
    };
  }

  buildWildcardQuery(field: string, pattern: string): Record<string, unknown> {
    return {
      wildcard: {
        [field]: pattern,
      },
    };
  }

  buildFuzzyQuery(field: string, value: string, fuzziness?: string | number): Record<string, unknown> {
    return {
      fuzzy: {
        [field]: {
          value,
          fuzziness: fuzziness || 'AUTO',
        },
      },
    };
  }

  buildBoolQuery(options: {
    must?: Array<Record<string, unknown>>;
    should?: Array<Record<string, unknown>>;
    must_not?: Array<Record<string, unknown>>;
    filter?: Array<Record<string, unknown>>;
    minimum_should_match?: number | string;
  }): Record<string, unknown> {
    return {
      bool: options,
    };
  }

  buildMultiMatchQuery(
    query: string,
    fields: string[],
    options?: {
      type?: 'best_fields' | 'most_fields' | 'cross_fields' | 'phrase' | 'phrase_prefix' | 'bool_prefix';
      fuzziness?: string | number;
      operator?: 'and' | 'or';
      minimum_should_match?: string | number;
    }
  ): Record<string, unknown> {
    return {
      multi_match: {
        query,
        fields,
        ...options,
      },
    };
  }

  buildExistsQuery(field: string): Record<string, unknown> {
    return {
      exists: {
        field,
      },
    };
  }

  buildPrefixQuery(field: string, prefix: string): Record<string, unknown> {
    return {
      prefix: {
        [field]: prefix,
      },
    };
  }

  buildRegexpQuery(field: string, pattern: string): Record<string, unknown> {
    return {
      regexp: {
        [field]: pattern,
      },
    };
  }

  buildNestedQuery(
    path: string,
    query: Record<string, unknown>,
    scoreMode?: 'avg' | 'sum' | 'min' | 'max' | 'none'
  ): Record<string, unknown> {
    return {
      nested: {
        path,
        query,
        score_mode: scoreMode || 'avg',
      },
    };
  }

  buildAggregation(name: string, aggregation: Record<string, unknown>): Record<string, Record<string, unknown>> {
    return {
      [name]: aggregation,
    };
  }

  buildTermsAggregation(field: string, size?: number): Record<string, unknown> {
    return {
      terms: {
        field,
        size: size || 10,
      },
    };
  }

  buildDateHistogramAggregation(
    field: string,
    interval: string,
    format?: string
  ): Record<string, unknown> {
    return {
      date_histogram: {
        field,
        calendar_interval: interval,
        format: format || 'yyyy-MM-dd',
      },
    };
  }

  buildAvgAggregation(field: string): Record<string, unknown> {
    return {
      avg: {
        field,
      },
    };
  }

  buildSumAggregation(field: string): Record<string, unknown> {
    return {
      sum: {
        field,
      },
    };
  }

  buildMaxAggregation(field: string): Record<string, unknown> {
    return {
      max: {
        field,
      },
    };
  }

  buildMinAggregation(field: string): Record<string, unknown> {
    return {
      min: {
        field,
      },
    };
  }

  buildSort(field: string, order: 'asc' | 'desc' = 'asc'): Record<string, string> {
    return {
      [field]: order,
    };
  }

  buildHighlight(
    fields: string[],
    options?: {
      pre_tags?: string[];
      post_tags?: string[];
      fragment_size?: number;
      number_of_fragments?: number;
    }
  ): Record<string, unknown> {
    const fieldsConfig = fields.reduce((acc, field) => {
      acc[field] = {};
      return acc;
    }, {} as Record<string, Record<string, unknown>>);

    return {
      fields: fieldsConfig,
      ...options,
    };
  }
} 