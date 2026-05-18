import { Test, TestingModule } from '@nestjs/testing';
import { ExamTemplatesController } from './exam-templates.controller';

describe('ExamTemplatesController', () => {
  let controller: ExamTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamTemplatesController],
    }).compile();

    controller = module.get<ExamTemplatesController>(ExamTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
