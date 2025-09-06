import { DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { OpenSearchService } from './services/opensearch/opensearch.service';
import { SearchService } from './search.service';
import { SearchConfig, IElasticSearchConfig, IOpenSearchConfig } from './models/dtos/config.dto';
import { IndexManagerService } from './services/index-manager/index-manager.service';
import { OpenSearchIndexManagerService } from './services/index-manager/opensearch-index-manager.service';

@Global()
@Module({})
export class ElasticsearchModule implements OnModuleInit {
  private readonly indexManager: IndexManagerService | OpenSearchIndexManagerService;

  constructor(
    private readonly elasticsearchIndexManager: IndexManagerService,
    private readonly openSearchIndexManager: OpenSearchIndexManagerService,
  ) {
    // The actual manager will be determined during initialization
    this.indexManager = this.elasticsearchIndexManager;
  }

  static forRoot(config: SearchConfig): DynamicModule {
    const providers = [];
    const engine = config.engine || 'elasticsearch';

    if (engine === 'opensearch') {
      providers.push(
        {
          provide: 'OPENSEARCH_CONFIG',
          useValue: config as IOpenSearchConfig,
        },
        OpenSearchService,
        OpenSearchIndexManagerService,
      );
    } else {
      providers.push(
        {
          provide: 'ELASTICSEARCH_CONFIG',
          useValue: config as IElasticSearchConfig,
        },
        ElasticsearchService,
        IndexManagerService,
      );
    }

    providers.push(
      {
        provide: 'SEARCH_CONFIG',
        useValue: config,
      },
      SearchService,
    );

    return {
      global: true,
      module: ElasticsearchModule,
      providers,
      exports: [SearchService],
    };
  }

  async onModuleInit(): Promise<void> {
    const config = this.getConfig();
    const engine = config.engine || 'elasticsearch';
    
    if (engine === 'opensearch') {
      await this.openSearchIndexManager.initialize();
    } else {
      await this.elasticsearchIndexManager.initialize();
    }
  }

  private getConfig(): SearchConfig {
    // This is a simplified approach - in a real implementation,
    // you might want to inject the config properly
    return {} as SearchConfig;
  }
}