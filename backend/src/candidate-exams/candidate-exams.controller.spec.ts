import { Test, TestingModule } from '@nestjs/testing';
import { CandidateExamsController } from './candidate-exams.controller';

describe('CandidateExamsController', () => {
  let controller: CandidateExamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateExamsController],
    }).compile();

    controller = module.get<CandidateExamsController>(CandidateExamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
