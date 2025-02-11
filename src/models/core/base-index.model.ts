import * as elasticsearch from '@elastic/elasticsearch';
import { Logger } from '@nestjs/common';
import { IField } from '../dtos/field.dto';
export interface IDoc {
  id: string;
}
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}
export type ESSort<T> = {
  [K in keyof Partial<T>]: SortDirection;
};
export interface ESFilterReqBody {
  index: string;
  type: string;
  analyzeWildcard?: boolean;
  body: {
    query?: any;
  };
  size?: number;
  from?: number;
  sort?: string[];
}
export type ESObjectFilter<T> = {
  [K in keyof Partial<T>]: string;
};
export type ElasticsearchFindResponse<T extends IDoc> = {
  hits: {
    hits: { _id: string; _source: T; _score: number }[];
    total: { value: number };
  };
};
export type ESFindResponse<T extends IDoc, D extends BaseDocument<T>> = {
  items: D[];
  total: number;
};
export type ESFilter<T> = ESObjectFilter<T> | string;
export class BaseDocument<T extends IDoc> {
  public id: string;
  constructor(data?: Partial<T>) {
    Object.keys(this.constructor.prototype.__fields).forEach((i) => {
      const field: IField = this.constructor.prototype.__fields[i];
      if (field.defaultValue) {
        this[i] = field.defaultValue;
      }
    });
    if (data) {
      this.apply(data);
    }
  }

  async get(): Promise<BaseDocument<T>> {
    try {
      const response: elasticsearch.ApiResponse<{ _source: T }> = await (
        this.constructor.prototype.client as elasticsearch.Client
      ).get({
        id: this.id,
        index: this.constructor.prototype.__indexName,
        type: this.constructor.prototype.__type,
        realtime: true,
        refresh: true,
      });
      this.apply(response.body._source);
      return this;
    } catch (e) {
      (this.constructor.prototype.logger as Logger).error(e);
      throw e;
    }
  }

  async findById(id: string): Promise<BaseDocument<T>> {
    try {
      const response: elasticsearch.ApiResponse<{ _source: T }> = await (
        this.constructor.prototype.client as elasticsearch.Client
      ).get({
        id: this.id || id,
        index: this.constructor.prototype.__indexName,
        type: this.constructor.prototype.__type,
        realtime: true,
        refresh: true,
      });
      this.apply(response.body._source);
      return this;
    } catch (e) {
      (this.constructor.prototype.logger as Logger).error(e);
      throw e;
    }
  }

  async save(): Promise<BaseDocument<T>> {
    try {
      const response: elasticsearch.ApiResponse<T> = await (
        this.constructor.prototype.client as elasticsearch.Client
      ).create<T, T>({
        id: this.id || undefined,
        index: this.constructor.prototype.__indexName,
        type: this.constructor.prototype.__type,
        refresh: true,
        version_type: 'internal',
        body: this.toObject(),
      });

      this.apply(response.body as T);
      return this;
    } catch (e) {
      (this.constructor.prototype.logger as Logger).error(e);
      throw e;
    }
  }

  async update(): Promise<BaseDocument<T>> {
    try {
      const response: elasticsearch.ApiResponse<T> = await (
        this.constructor.prototype.client as elasticsearch.Client
      ).update<T, { doc: T }>({
        id: this.id,
        index: this.constructor.prototype.__indexName,
        type: this.constructor.prototype.__type,
        refresh: true,
        body: { doc: this.toObject() },
      });
      this.apply(response.body as T);
      return this;
    } catch (e) {
      (this.constructor.prototype.logger as Logger).error(e);
      throw e;
    }
  }

  async partialUpdate(data: Partial<T>): Promise<BaseDocument<T>> {
    try {
      await (this.constructor.prototype.client as elasticsearch.Client).update<
        T,
        { doc: Partial<T> }
      >({
        id: this.id,
        index: this.constructor.prototype.__indexName,
        type: this.constructor.prototype.__type,
        refresh: true,
        body: { doc: { ...data } },
      });
      return await this.get();
    } catch (e) {
      (this.constructor.prototype.logger as Logger).error(e);
      throw e;
    }
  }

  async remove(): Promise<boolean> {
    try {
      await (this.constructor.prototype.client as elasticsearch.Client).delete({
        id: this.id,
        index: this.constructor.prototype.__indexName,
        type: this.constructor.prototype.__type,
        refresh: true,
      });
      return true;
    } catch (e) {
      throw e;
    }
  }

  async find<D extends BaseDocument<T>>(
    params: ESFilter<T>,
    from?: number,
    size?: number,
    sort?: { [key: string]: SortDirection },
  ): Promise<ESFindResponse<T, D>> {
    const query = this.generateQuery(params);
    let body: ESFilterReqBody = {
      index: this.constructor.prototype.__indexName,
      type: this.constructor.prototype.__type,
      body: {
        query: query,
      },
    };
    if (typeof from === 'number') {
      body = { ...body, from };
    }
    if (size) {
      body = { ...body, size };
    }
    if (sort) {
      body = { ...body, sort: this.generateSort(sort) };
    }
    try {
      const data: elasticsearch.ApiResponse<ElasticsearchFindResponse<T>> =
        await (
          this.constructor.prototype.client as elasticsearch.Client
        ).search({ ...body });
      const {
        body: {
          hits: {
            hits,
            total: { value },
          },
        },
      } = data;
      const items: D[] = hits.map(({ _id, _source }) => {
        const doc: D = new (<any>this.constructor)();
        doc.apply({ ..._source, id: _id });
        return doc;
      });
      return { items, total: value };
    } catch (e) {
      (this.constructor.prototype.logger as Logger).error(e);
      throw e;
    }
  }

  async removeWhereNotIn(term: string, array: string[]): Promise<number> {
    try {
      const body: ESFilterReqBody = {
        index: this.constructor.prototype.__indexName,
        type: this.constructor.prototype.__type,
        body: {
          query: {
            bool: {
              must_not: {
                terms: {
                  [term]: array,
                },
              },
            },
          },
        },
      };
      const response = await (
        this.constructor.prototype.client as elasticsearch.Client
      ).delete_by_query({ ...body });
      return response.body.deleted;
    } catch (e) {
      throw e;
    }
  }

  private generateSort(sort: { [key: string]: SortDirection }): string[] {
    return Object.keys(sort).map((f) => `${f}:${sort[f].toLowerCase()}`);
  }

  private generateQuery(params: ESFilter<T>) {
    if (typeof params === 'string') {
      return {
        multi_match: {
          query: params,
          fields: ['*'],
        },
      };
    } else {
      const filter: ESObjectFilter<T> = params as ESObjectFilter<T>;
      if (Object.keys(filter).length === 1) {
        return {
          match: filter,
        };
      }
      const query = {
        bool: {
          must: Object.keys(filter).map((k) => ({
            match: { [k]: filter[k] },
          })),
        },
      };
      return query;
    }
  }

  private apply(data: Partial<T>) {
    this.id = data?.id || this.id;
    Object.keys(data).forEach((attr) => {
      if (this.constructor.prototype.__fields.hasOwnProperty(attr)) {
        this[attr] = data[attr];
      }
    });
  }

  toObject(): T {
    try {
      let data: T = {} as T;
      Object.keys(this.constructor.prototype.__fields).forEach((i) => {
        const field = this.constructor.prototype.__fields[i];
        data = {
          ...data,
          [field.fieldName]:
            this[field.fieldName] || field.default || undefined,
        };
      });
      return data;
    } catch (e) {
      throw e;
    }
  }

  toJson(): T {
    try {
      return this.toObject();
    } catch (e) {
      throw e;
    }
  }
}
