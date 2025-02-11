import { Test, TestingModule } from '@nestjs/testing';
import { IndexManagerService } from './index-manager.service';

describe('IndexManagerService', () => {
  let service: IndexManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndexManagerService],
    }).compile();

    service = module.get<IndexManagerService>(IndexManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
