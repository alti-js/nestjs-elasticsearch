import { DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { MultiRegionOpenSearchService } from './services/opensearch/multi-region-opensearch.service';
import { MultiRegionSearchConfig } from './models/dtos/multi-region-config.dto';

@Global()
@Module({})
export class MultiRegionElasticsearchModule implements OnModuleInit {
  constructor(
    private readonly multiRegionOpenSearchService: MultiRegionOpenSearchService,
  ) {}

  static forRoot(config: MultiRegionSearchConfig): DynamicModule {
    const providers = [];

    if (config.engine === 'opensearch') {
      providers.push(
        {
          provide: 'MULTI_REGION_OPENSEARCH_CONFIG',
          useValue: config,
        },
        MultiRegionOpenSearchService,
      );
    } else {
      // For Elasticsearch, you can implement similar multi-region support
      throw new Error('Multi-region Elasticsearch support not implemented yet');
    }

    return {
      global: true,
      module: MultiRegionElasticsearchModule,
      providers,
      exports: [MultiRegionOpenSearchService],
    };
  }

  async onModuleInit(): Promise<void> {
    // Initialize all region clients
    const regions = this.multiRegionOpenSearchService.getAvailableRegions();
    console.log(`Multi-region module initialized with regions: ${regions.join(', ')}`);
  }
} 