import { Test, TestingModule } from '@nestjs/testing';
import { RecruitmentProcessesService } from './recruitment-processes.service';

describe('RecruitmentProcessesService', () => {
  let service: RecruitmentProcessesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruitmentProcessesService],
    }).compile();

    service = module.get<RecruitmentProcessesService>(RecruitmentProcessesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
