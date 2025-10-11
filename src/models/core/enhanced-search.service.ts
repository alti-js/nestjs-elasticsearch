import { IField } from '../dtos/field.dto';
import { 
  CreateIndexResponse, 
  BulkResponse, 
  SearchResponse, 
  UpdateByQueryResponse, 
  ReindexResponse,
  SearchQuery,
  SearchDocument,
  DeleteIndexResponse,
  IndexExistsResponse,
  IndexStatsResponse,
  ClusterHealthResponse,
  AliasResponse,
  GetAliasesResponse,
  IndexTemplateResponse,
  GetIndexTemplateResponse,
  OperationResponse,
  IndexSettings
} from '../dtos/search-types.dto';

export interface IEnhancedSearchService {
  // Basic CRUD operations (existing)
  createIndex(indexName: string, fields: IField[]): Promise<CreateIndexResponse>;
  bulkInsert(docs: SearchDocument[], index: string, type: string): Promise<BulkResponse>;
  searchIndex(
    q: string,
    index: string,
    skip: number,
    limit: number,
    queryType: string,
    fields: string[],
  ): Promise<SearchResponse>;
  updateIndex(
    index: string,
    query: SearchQuery,
    updatedFields: Record<string, unknown>,
  ): Promise<UpdateByQueryResponse>;
  removeDocumentFromIndex(indexName: string, query: SearchQuery): Promise<UpdateByQueryResponse>;
  reindex(
    indexFrom: string,
    indexDest: string,
    query: SearchQuery,
  ): Promise<ReindexResponse>;
  generateQuery(q: string, queryType: string, fields: string[]): SearchQuery;

  // Enhanced Index CRUD operations (missing)
  deleteIndex(indexName: string): Promise<DeleteIndexResponse>;
  indexExists(indexName: string): Promise<boolean>;
  getIndexInfo(indexName: string): Promise<IndexExistsResponse>;
  updateIndexSettings(indexName: string, settings: IndexSettings): Promise<OperationResponse>;
  getIndexStats(indexName: string): Promise<IndexStatsResponse>;
  getIndexHealth(indexName: string): Promise<ClusterHealthResponse>;
  
  // Index Alias operations
  createAlias(indexName: string, aliasName: string): Promise<AliasResponse>;
  deleteAlias(indexName: string, aliasName: string): Promise<AliasResponse>;
  getAliases(indexName?: string): Promise<GetAliasesResponse>;
  
  // Document operations
  documentExists(indexName: string, documentId: string): Promise<boolean>;
  
  // Index Template operations
  createIndexTemplate(templateName: string, template: Record<string, unknown>): Promise<IndexTemplateResponse>;
  deleteIndexTemplate(templateName: string): Promise<OperationResponse>;
  getIndexTemplate(templateName: string): Promise<GetIndexTemplateResponse>;
  
  // Advanced operations
  closeIndex(indexName: string): Promise<OperationResponse>;
  openIndex(indexName: string): Promise<OperationResponse>;
  refreshIndex(indexName: string): Promise<OperationResponse>;
  flushIndex(indexName: string): Promise<OperationResponse>;
  forceMergeIndex(indexName: string): Promise<OperationResponse>;
} 