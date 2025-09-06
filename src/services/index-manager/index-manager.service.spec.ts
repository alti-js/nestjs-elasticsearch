import { Test, TestingModule } from '@nestjs/testing';
import { IndexManagerService } from './index-manager.service';
import { IElasticSearchConfig } from '../../models/dtos/config.dto';

describe('IndexManagerService', () => {
  let service: IndexManagerService;

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
        IndexManagerService,
        {
          provide: 'ELASTICSEARCH_CONFIG',
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<IndexManagerService>(IndexManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
