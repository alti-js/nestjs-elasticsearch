export * from './elasticsearch.module';
export * from './elasticsearch.service';
export * from './search.service';
export * from './services/opensearch/opensearch.service';
export * from './services/opensearch/enhanced-opensearch.service';
export * from './models/dtos/config.dto';
export * from './models/dtos/field.dto';
export * from './models/core/base-index.model';
export * from './models/core/base-search.service';
export * from './models/core/enhanced-search.service';
export * from './decorators/es-index.decorator';
export * from './helpers/index-name.helper';

// Multi-region exports
export * from './multi-region-elasticsearch.module';
export * from './services/opensearch/multi-region-opensearch.service';
export * from './models/dtos/multi-region-config.dto';