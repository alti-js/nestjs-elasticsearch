import { IField } from '../dtos/field.dto';
import { 
  CreateIndexResponse, 
  BulkResponse, 
  SearchResponse, 
  UpdateByQueryResponse, 
  ReindexResponse,
  SearchQuery,
  SearchDocument
} from '../dtos/search-types.dto';

export interface ISearchService {
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
} 