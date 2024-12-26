import { Test, TestingModule } from '@nestjs/testing';
import { SagaManagerService } from './saga-manager.service';

describe('SagaManagerService', () => {
  let service: SagaManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SagaManagerService],
    }).compile();

    service = module.get<SagaManagerService>(SagaManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
