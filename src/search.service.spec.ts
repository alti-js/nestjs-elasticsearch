import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { ElasticsearchService } from './elasticsearch.service';
import { OpenSearchService } from './services/opensearch/opensearch.service';
import { SearchConfig } from './models/dtos/config.dto';

describe('SearchService', () => {
  let service: SearchService;
  let elasticsearchService: ElasticsearchService;
  let openSearchService: OpenSearchService;

  const mockElasticsearchConfig: SearchConfig = {
    index: 'test-index',
    node: 'http://localhost',
    port: '9200',
    auth: {
      username: 'elastic',
      password: 'changeme',
    },
    engine: 'elasticsearch',
  };

  const mockOpenSearchConfig: SearchConfig = {
    index: 'test-index',
    node: 'http://localhost',
    port: '9200',
    auth: {
      username: 'admin',
      password: 'admin',
    },
    engine: 'opensearch',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: 'SEARCH_CONFIG',
          useValue: mockElasticsearchConfig,
        },
        {
          provide: ElasticsearchService,
          useValue: {
            createIndex: jest.fn(),
            bulkInsert: jest.fn(),
            searchIndex: jest.fn(),
            updateIndex: jest.fn(),
            removeDocumentFromIndex: jest.fn(),
            reindex: jest.fn(),
            generateQuery: jest.fn(),
          },
        },
        {
          provide: OpenSearchService,
          useValue: {
            createIndex: jest.fn(),
            bulkInsert: jest.fn(),
            searchIndex: jest.fn(),
            updateIndex: jest.fn(),
            removeDocumentFromIndex: jest.fn(),
            reindex: jest.fn(),
            generateQuery: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
    openSearchService = module.get<OpenSearchService>(OpenSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return elasticsearch as default engine type', () => {
    expect(service.getEngineType()).toBe('elasticsearch');
  });

  it('should delegate createIndex to elasticsearch service when engine is elasticsearch', async () => {
    const mockFields = [{ fieldName: 'title', type: 'text' }];
    await service.createIndex('test-index', mockFields);
    expect(elasticsearchService.createIndex).toHaveBeenCalledWith('test-index', mockFields);
  });

  it('should delegate searchIndex to elasticsearch service when engine is elasticsearch', async () => {
    await service.searchIndex('test query', 'test-index', 0, 10, 'SimpleQuery', ['title']);
    expect(elasticsearchService.searchIndex).toHaveBeenCalledWith(
      'test query',
      'test-index',
      0,
      10,
      'SimpleQuery',
      ['title']
    );
  });

  it('should delegate updateIndex to elasticsearch service when engine is elasticsearch', async () => {
    const query = { match: { id: '123' } };
    const updates = { title: 'Updated Title' };
    await service.updateIndex('test-index', query, updates);
    expect(elasticsearchService.updateIndex).toHaveBeenCalledWith('test-index', query, updates);
  });

  it('should delegate removeDocumentFromIndex to elasticsearch service when engine is elasticsearch', async () => {
    const query = { match: { id: '123' } };
    await service.removeDocumentFromIndex('test-index', query);
    expect(elasticsearchService.removeDocumentFromIndex).toHaveBeenCalledWith('test-index', query);
  });

  it('should delegate reindex to elasticsearch service when engine is elasticsearch', async () => {
    const query = { match_all: {} };
    await service.reindex('source-index', 'dest-index', query);
    expect(elasticsearchService.reindex).toHaveBeenCalledWith('source-index', 'dest-index', query);
  });

  it('should delegate generateQuery to elasticsearch service when engine is elasticsearch', () => {
    service.generateQuery('test query', 'SimpleQuery', ['title']);
    expect(elasticsearchService.generateQuery).toHaveBeenCalledWith('test query', 'SimpleQuery', ['title']);
  });
}); 