import { Injectable, Inject, Logger } from '@nestjs/common';
import { SearchConfig, SearchEngineType } from './models/dtos/config.dto';
import { ISearchService } from './models/core/base-search.service';
import { IField } from './models/dtos/field.dto';
import { 
  CreateIndexResponse, 
  BulkResponse, 
  SearchResponse, 
  UpdateByQueryResponse, 
  ReindexResponse,
  SearchQuery,
  SearchDocument
} from './models/dtos/search-types.dto';
import { ElasticsearchService } from './elasticsearch.service';
import { OpenSearchService } from './services/opensearch/opensearch.service';

@Injectable()
export class SearchService implements ISearchService {
  private readonly logger: Logger = new Logger(SearchService.name);
  private readonly searchService: ISearchService;
  private readonly engineType: SearchEngineType;

  constructor(
    @Inject('SEARCH_CONFIG') private config: SearchConfig,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly openSearchService: OpenSearchService,
  ) {
    this.engineType = config.engine || 'elasticsearch';
    this.searchService = this.engineType === 'opensearch' 
      ? this.openSearchService 
      : this.elasticsearchService;
    
    this.logger.log(`Initialized SearchService with engine: ${this.engineType}`);
  }

  async createIndex(indexName: string, fields: IField[]): Promise<CreateIndexResponse> {
    return this.searchService.createIndex(indexName, fields);
  }

  async bulkInsert(docs: SearchDocument[], index: string, type: string): Promise<BulkResponse> {
    return this.searchService.bulkInsert(docs, index, type);
  }

  async searchIndex(
    q: string,
    index: string,
    skip: number,
    limit: number,
    queryType: string,
    fields: string[],
  ): Promise<SearchResponse> {
    return this.searchService.searchIndex(q, index, skip, limit, queryType, fields);
  }

  async updateIndex(
    index: string,
    query: SearchQuery,
    updatedFields: Record<string, unknown>,
  ): Promise<UpdateByQueryResponse> {
    return this.searchService.updateIndex(index, query, updatedFields);
  }

  async removeDocumentFromIndex(indexName: string, query: SearchQuery): Promise<UpdateByQueryResponse> {
    return this.searchService.removeDocumentFromIndex(indexName, query);
  }

  async reindex(
    indexFrom: string,
    indexDest: string,
    query: SearchQuery,
  ): Promise<ReindexResponse> {
    return this.searchService.reindex(indexFrom, indexDest, query);
  }

  generateQuery(q: string, queryType: string, fields: string[]): SearchQuery {
    return this.searchService.generateQuery(q, queryType, fields);
  }

  getEngineType(): SearchEngineType {
    return this.engineType;
  }
} 