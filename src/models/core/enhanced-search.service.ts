import { IField } from '../dtos/field.dto';

export interface IEnhancedSearchService {
  // Basic CRUD operations (existing)
  createIndex(indexName: string, fields: IField[]): Promise<any>;
  bulkInsert(docs: any[], index: string, type: string): Promise<any>;
  searchIndex(
    q: string,
    index: string,
    skip: number,
    limit: number,
    queryType: string,
    fields: string[],
  ): Promise<any>;
  updateIndex(
    index: string,
    query: any,
    updatedFields: any,
  ): Promise<any>;
  removeDocumentFromIndex(indexName: string, query: any): Promise<any>;
  reindex(
    indexFrom: string,
    indexDest: string,
    query: any,
  ): Promise<any>;
  generateQuery(q: string, queryType: string, fields: string[]): any;

  // Enhanced Index CRUD operations (missing)
  deleteIndex(indexName: string): Promise<any>;
  indexExists(indexName: string): Promise<boolean>;
  getIndexInfo(indexName: string): Promise<any>;
  updateIndexSettings(indexName: string, settings: any): Promise<any>;
  getIndexStats(indexName: string): Promise<any>;
  getIndexHealth(indexName: string): Promise<any>;
  
  // Index Alias operations
  createAlias(indexName: string, aliasName: string): Promise<any>;
  deleteAlias(indexName: string, aliasName: string): Promise<any>;
  getAliases(indexName?: string): Promise<any>;
  
  // Index Template operations
  createIndexTemplate(templateName: string, template: any): Promise<any>;
  deleteIndexTemplate(templateName: string): Promise<any>;
  getIndexTemplate(templateName: string): Promise<any>;
  
  // Advanced operations
  closeIndex(indexName: string): Promise<any>;
  openIndex(indexName: string): Promise<any>;
  refreshIndex(indexName: string): Promise<any>;
  flushIndex(indexName: string): Promise<any>;
  forceMergeIndex(indexName: string): Promise<any>;
} 