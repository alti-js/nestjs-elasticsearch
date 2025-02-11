import { DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { IElasticSearchConfig } from './models/dtos/config.dto';
import { IndexManagerService } from './services/index-manager/index-manager.service';
@Global()
@Module({
  providers: [ElasticsearchService, IndexManagerService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule implements OnModuleInit {
  constructor(private readonly manager: IndexManagerService) {}
  static forRoot(config: IElasticSearchConfig): DynamicModule {
    return {
      global: true,
      module: ElasticsearchModule,
      providers: [
        {
          provide: 'ELASTICSEARCH_CONFIG',
          useValue: config,
        },
        ElasticsearchService,
      ],
      exports: [ElasticsearchService],
    };
  }
  async onModuleInit(): Promise<void> {
    await this.manager.initialize();
  }
}