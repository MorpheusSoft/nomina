import { Test, TestingModule } from '@nestjs/testing';
import { ExamTemplatesService } from './exam-templates.service';

describe('ExamTemplatesService', () => {
  let service: ExamTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamTemplatesService],
    }).compile();

    service = module.get<ExamTemplatesService>(ExamTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
