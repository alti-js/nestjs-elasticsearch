// Type definitions for Elasticsearch and OpenSearch operations
export interface SearchDocument {
  [key: string]: unknown;
}

export interface SearchQuery {
  [key: string]: unknown;
}

export interface SearchResponse<T = SearchDocument> {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number | null;
    hits: SearchHit<T>[];
  };
  aggregations?: Record<string, unknown>;
}

export interface SearchHit<T = SearchDocument> {
  _index: string;
  _type?: string;
  _id: string;
  _score: number | null;
  _source: T;
  highlight?: Record<string, string[]>;
}

export interface BulkResponse {
  took: number;
  errors: boolean;
  items: BulkResponseItem[];
}

export interface BulkResponseItem {
  index?: BulkItemResponse;
  create?: BulkItemResponse;
  update?: BulkItemResponse;
  delete?: BulkItemResponse;
}

export interface BulkItemResponse {
  _index: string;
  _type?: string;
  _id: string;
  _version?: number;
  result?: string;
  _shards?: {
    total: number;
    successful: number;
    failed: number;
  };
  status: number;
  error?: {
    type: string;
    reason: string;
  };
}

export interface IndexResponse {
  _index: string;
  _type?: string;
  _id: string;
  _version: number;
  result: string;
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface GetResponse<T = SearchDocument> {
  _index: string;
  _type?: string;
  _id: string;
  _version?: number;
  _seq_no?: number;
  _primary_term?: number;
  found: boolean;
  _source?: T;
}

export interface DeleteResponse {
  _index: string;
  _type?: string;
  _id: string;
  _version: number;
  result: string;
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface UpdateResponse {
  _index: string;
  _type?: string;
  _id: string;
  _version: number;
  result: string;
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface IndexSettings {
  number_of_shards?: number;
  number_of_replicas?: number;
  refresh_interval?: string;
  max_result_window?: number;
  [key: string]: unknown;
}

export interface IndexMappings {
  properties: Record<string, MappingProperty>;
  [key: string]: unknown;
}

export interface MappingProperty {
  type: string;
  index?: boolean;
  analyzer?: string;
  format?: string;
  properties?: Record<string, MappingProperty>;
  [key: string]: unknown;
}

export interface CreateIndexResponse {
  acknowledged: boolean;
  shards_acknowledged: boolean;
  index: string;
}

export interface DeleteIndexResponse {
  acknowledged: boolean;
}

export interface IndexExistsResponse {
  [indexName: string]: {
    aliases: Record<string, unknown>;
    mappings: IndexMappings;
    settings: {
      index: IndexSettings;
    };
  };
}

export interface IndexStatsResponse {
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _all: {
    primaries: IndexStats;
    total: IndexStats;
  };
  indices: Record<string, {
    primaries: IndexStats;
    total: IndexStats;
  }>;
}

export interface IndexStats {
  docs: {
    count: number;
    deleted: number;
  };
  store: {
    size_in_bytes: number;
  };
  indexing: {
    index_total: number;
    index_time_in_millis: number;
  };
  search: {
    query_total: number;
    query_time_in_millis: number;
  };
}

export interface ClusterHealthResponse {
  cluster_name: string;
  status: 'green' | 'yellow' | 'red';
  timed_out: boolean;
  number_of_nodes: number;
  number_of_data_nodes: number;
  active_primary_shards: number;
  active_shards: number;
  relocating_shards: number;
  initializing_shards: number;
  unassigned_shards: number;
  delayed_unassigned_shards: number;
  number_of_pending_tasks: number;
  number_of_in_flight_fetch: number;
  task_max_waiting_in_queue_millis: number;
  active_shards_percent_as_number: number;
}

export interface AliasResponse {
  acknowledged: boolean;
}

export interface GetAliasesResponse {
  [indexName: string]: {
    aliases: Record<string, Record<string, unknown>>;
  };
}

export interface IndexTemplateResponse {
  acknowledged: boolean;
}

export interface GetIndexTemplateResponse {
  [templateName: string]: {
    order: number;
    index_patterns: string[];
    settings: IndexSettings;
    mappings: IndexMappings;
    aliases: Record<string, unknown>;
  };
}

// Generic operation response for operations that don't return specific data
export interface OperationResponse {
  acknowledged: boolean;
}

// Update by query response
export interface UpdateByQueryResponse {
  took: number;
  timed_out: boolean;
  total: number;
  updated: number;
  deleted: number;
  batches: number;
  version_conflicts: number;
  noops: number;
  retries: {
    bulk: number;
    search: number;
  };
  throttled_millis: number;
  requests_per_second: number;
  throttled_until_millis: number;
  failures: unknown[];
}

// Reindex response
export interface ReindexResponse {
  took: number;
  timed_out: boolean;
  total: number;
  updated: number;
  created: number;
  deleted: number;
  batches: number;
  version_conflicts: number;
  noops: number;
  retries: {
    bulk: number;
    search: number;
  };
  throttled_millis: number;
  requests_per_second: number;
  throttled_until_millis: number;
  failures: unknown[];
} 