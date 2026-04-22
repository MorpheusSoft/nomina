import { Test, TestingModule } from '@nestjs/testing';
import { WorkerAbsencesController } from './worker-absences.controller';
import { WorkerAbsencesService } from './worker-absences.service';

describe('WorkerAbsencesController', () => {
  let controller: WorkerAbsencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkerAbsencesController],
      providers: [WorkerAbsencesService],
    }).compile();

    controller = module.get<WorkerAbsencesController>(WorkerAbsencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
