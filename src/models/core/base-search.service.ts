import { IField } from '../dtos/field.dto';

export interface ISearchService {
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
} 