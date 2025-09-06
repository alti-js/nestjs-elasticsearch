import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from './elasticsearch.service';
import { IElasticSearchConfig } from './models/dtos/config.dto';

describe('ElasticsearchService', () => {
  let service: ElasticsearchService;

  const mockConfig: IElasticSearchConfig = {
    index: 'test-index',
    node: 'http://localhost',
    port: '9200',
    auth: {
      username: 'elastic',
      password: 'changeme',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchService,
        {
          provide: 'ELASTICSEARCH_CONFIG',
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<ElasticsearchService>(ElasticsearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
