import { Injectable, Inject, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { 
  IMultiRegionOpenSearchConfig, 
  Region, 
  IClusterConfig,
  IRegionRequest 
} from '../../models/dtos/multi-region-config.dto';
import { IField } from '../../models/dtos/field.dto';

@Injectable()
export class MultiRegionOpenSearchService {
  private readonly logger: Logger = new Logger(MultiRegionOpenSearchService.name);
  private readonly config: IMultiRegionOpenSearchConfig;
  private readonly clients: Map<Region, Client> = new Map();
  private readonly defaultRegion: Region;

  constructor(
    @Inject('MULTI_REGION_OPENSEARCH_CONFIG') private options: IMultiRegionOpenSearchConfig,
  ) {
    this.config = options;
    this.defaultRegion = options.defaultRegion || 'singapore';
    this.initializeClients();
  }

  private initializeClients(): void {
    Object.entries(this.config.regions).forEach(([region, clusterConfig]) => {
      const client = new Client({
        node: `${clusterConfig.node}:${clusterConfig.port}`,
        auth: {
          username: clusterConfig.auth.username,
          password: clusterConfig.auth.password,
        },
      });
      this.clients.set(region as Region, client);
      this.logger.log(`Initialized OpenSearch client for region: ${region}`);
    });
  }

  private getClient(region: Region): Client {
    const client = this.clients.get(region);
    if (!client) {
      throw new Error(`No OpenSearch client found for region: ${region}`);
    }
    return client;
  }

  private getIndexName(region: Region, baseIndex: string): string {
    const prefix = this.config.indexPrefix || '';
    return `${prefix}${baseIndex}-${region}`;
  }

  // ===== SINGLE DOCUMENT CRUD OPERATIONS =====

  async addDocument(region: Region, baseIndex: string, document: any, documentId?: string): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Adding document to region: ${region}, index: ${indexName}`);
      
      const params: any = {
        index: indexName,
        body: document,
      };
      
      if (documentId) {
        params.id = documentId;
      }
      
      return await client.index(params);
    } catch (e) {
      this.logger.error(`Failed to add document to region ${region}:`, e);
      throw e;
    }
  }

  async getDocument(region: Region, baseIndex: string, documentId: string): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Getting document ${documentId} from region: ${region}, index: ${indexName}`);
      
      const response = await client.get({
        index: indexName,
        id: documentId,
      });
      return response.body._source;
    } catch (e) {
      this.logger.error(`Failed to get document from region ${region}:`, e);
      throw e;
    }
  }

  async updateDocument(region: Region, baseIndex: string, documentId: string, document: any): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Updating document ${documentId} in region: ${region}, index: ${indexName}`);
      
      return await client.update({
        index: indexName,
        id: documentId,
        body: {
          doc: document,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to update document in region ${region}:`, e);
      throw e;
    }
  }

  async deleteDocument(region: Region, baseIndex: string, documentId: string): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Deleting document ${documentId} from region: ${region}, index: ${indexName}`);
      
      return await client.delete({
        index: indexName,
        id: documentId,
      });
    } catch (e) {
      this.logger.error(`Failed to delete document from region ${region}:`, e);
      throw e;
    }
  }

  async upsertDocument(region: Region, baseIndex: string, documentId: string, document: any): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Upserting document ${documentId} in region: ${region}, index: ${indexName}`);
      
      return await client.update({
        index: indexName,
        id: documentId,
        body: {
          doc: document,
          doc_as_upsert: true,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to upsert document in region ${region}:`, e);
      throw e;
    }
  }

  // ===== BULK OPERATIONS =====

  async bulkInsert(region: Region, baseIndex: string, docs: any[]): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Bulk inserting ${docs.length} documents to region: ${region}, index: ${indexName}`);
      
      const bulk = [];
      docs.forEach((doc) => {
        bulk.push({
          index: { _index: indexName },
        });
        bulk.push(doc);
      });
      
      return await client.bulk({
        body: bulk,
      });
    } catch (e) {
      this.logger.error(`Failed to bulk insert to region ${region}:`, e);
      throw e;
    }
  }

  // ===== SEARCH OPERATIONS =====

  async searchIndex(
    region: Region,
    baseIndex: string,
    q: string,
    skip: number,
    limit: number,
    queryType: string,
    fields: string[],
  ): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Searching in region: ${region}, index: ${indexName}, query: ${q}`);
      
      const query = this.generateQuery(q, queryType, fields);
      const body = {
        size: limit,
        from: skip,
        query: query,
      };
      
      return await client.search({ index: indexName, body });
    } catch (e) {
      this.logger.error(`Failed to search in region ${region}:`, e);
      throw e;
    }
  }

  // ===== INDEX OPERATIONS =====

  async createIndex(region: Region, baseIndex: string, fields: IField[]): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Creating index in region: ${region}, index: ${indexName}`);
      
      const fieldsList = fields.reduce(
        (obj, item) =>
          Object.assign(obj, { [item.fieldName]: { type: item.type } }),
        {},
      );
      
      const existsStatus = await client.indices.exists({
        index: indexName,
      });

      if (existsStatus && existsStatus.statusCode === 200) {
        return client.indices.putMapping({
          index: indexName,
          body: {
            properties: fieldsList,
          },
        });
      } else {
        return client.indices.create({
          index: indexName,
          body: {
            mappings: {
              properties: fieldsList,
            },
          },
        });
      }
    } catch (e) {
      this.logger.error(`Failed to create index in region ${region}:`, e);
      throw e;
    }
  }

  async deleteIndex(region: Region, baseIndex: string): Promise<any> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      this.logger.log(`Deleting index in region: ${region}, index: ${indexName}`);
      
      return await client.indices.delete({
        index: indexName,
      });
    } catch (e) {
      this.logger.error(`Failed to delete index in region ${region}:`, e);
      throw e;
    }
  }

  async indexExists(region: Region, baseIndex: string): Promise<boolean> {
    try {
      const client = this.getClient(region);
      const indexName = this.getIndexName(region, baseIndex);
      
      const response = await client.indices.exists({
        index: indexName,
      });
      return response.statusCode === 200;
    } catch (e) {
      this.logger.error(`Failed to check if index exists in region ${region}:`, e);
      return false;
    }
  }

  // ===== CROSS-REGION OPERATIONS =====

  async searchAcrossRegions(
    baseIndex: string,
    q: string,
    skip: number,
    limit: number,
    queryType: string,
    fields: string[],
    regions?: Region[]
  ): Promise<any> {
    try {
      const targetRegions = regions || Object.keys(this.config.regions) as Region[];
      const searchPromises = targetRegions.map(region => 
        this.searchIndex(region, baseIndex, q, skip, limit, queryType, fields)
      );
      
      const results = await Promise.allSettled(searchPromises);
      
      // Combine results from all regions
      const combinedResults = {
        total: 0,
        hits: [],
        regions: {}
      };
      
      results.forEach((result, index) => {
        const region = targetRegions[index];
        if (result.status === 'fulfilled') {
          combinedResults.regions[region] = result.value.body;
          combinedResults.total += result.value.body.hits?.total?.value || 0;
          combinedResults.hits.push(...(result.value.body.hits?.hits || []));
        } else {
          this.logger.error(`Search failed for region ${region}:`, result.reason);
          combinedResults.regions[region] = { error: result.reason.message };
        }
      });
      
      return combinedResults;
    } catch (e) {
      this.logger.error('Failed to search across regions:', e);
      throw e;
    }
  }

  async bulkInsertAcrossRegions(
    baseIndex: string,
    docs: any[],
    regions?: Region[]
  ): Promise<any> {
    try {
      const targetRegions = regions || Object.keys(this.config.regions) as Region[];
      const insertPromises = targetRegions.map(region => 
        this.bulkInsert(region, baseIndex, docs)
      );
      
      const results = await Promise.allSettled(insertPromises);
      
      const combinedResults = {
        success: true,
        regions: {}
      };
      
      results.forEach((result, index) => {
        const region = targetRegions[index];
        if (result.status === 'fulfilled') {
          combinedResults.regions[region] = result.value.body;
        } else {
          combinedResults.regions[region] = { error: result.reason.message };
          combinedResults.success = false;
        }
      });
      
      return combinedResults;
    } catch (e) {
      this.logger.error('Failed to bulk insert across regions:', e);
      throw e;
    }
  }

  // ===== UTILITY METHODS =====

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

  getAvailableRegions(): Region[] {
    return Object.keys(this.config.regions) as Region[];
  }

  getDefaultRegion(): Region {
    return this.defaultRegion;
  }

  getClusterConfig(region: Region): IClusterConfig {
    return this.config.regions[region];
  }

  // ===== REQUEST-BASED OPERATIONS =====

  async addDocumentByRequest(request: IRegionRequest, baseIndex: string, document: any, documentId?: string): Promise<any> {
    return this.addDocument(request.region, baseIndex, document, documentId);
  }

  async getDocumentByRequest(request: IRegionRequest, baseIndex: string, documentId: string): Promise<any> {
    return this.getDocument(request.region, baseIndex, documentId);
  }

  async updateDocumentByRequest(request: IRegionRequest, baseIndex: string, documentId: string, document: any): Promise<any> {
    return this.updateDocument(request.region, baseIndex, documentId, document);
  }

  async deleteDocumentByRequest(request: IRegionRequest, baseIndex: string, documentId: string): Promise<any> {
    return this.deleteDocument(request.region, baseIndex, documentId);
  }

  async searchByRequest(
    request: IRegionRequest,
    baseIndex: string,
    q: string,
    skip: number,
    limit: number,
    queryType: string,
    fields: string[]
  ): Promise<any> {
    return this.searchIndex(request.region, baseIndex, q, skip, limit, queryType, fields);
  }
} 