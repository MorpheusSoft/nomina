import { Test, TestingModule } from '@nestjs/testing';
import { RecruitmentProcessesController } from './recruitment-processes.controller';

describe('RecruitmentProcessesController', () => {
  let controller: RecruitmentProcessesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruitmentProcessesController],
    }).compile();

    controller = module.get<RecruitmentProcessesController>(RecruitmentProcessesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
