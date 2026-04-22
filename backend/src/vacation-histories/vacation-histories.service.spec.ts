import { Test, TestingModule } from '@nestjs/testing';
import { VacationHistoriesService } from './vacation-histories.service';

describe('VacationHistoriesService', () => {
  let service: VacationHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VacationHistoriesService],
    }).compile();

    service = module.get<VacationHistoriesService>(VacationHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
