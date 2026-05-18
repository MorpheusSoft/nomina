import { Test, TestingModule } from '@nestjs/testing';
import { CandidateExamsService } from './candidate-exams.service';

describe('CandidateExamsService', () => {
  let service: CandidateExamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidateExamsService],
    }).compile();

    service = module.get<CandidateExamsService>(CandidateExamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
