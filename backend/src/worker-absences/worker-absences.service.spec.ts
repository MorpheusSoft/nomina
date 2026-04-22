import { Test, TestingModule } from '@nestjs/testing';
import { WorkerAbsencesService } from './worker-absences.service';

describe('WorkerAbsencesService', () => {
  let service: WorkerAbsencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkerAbsencesService],
    }).compile();

    service = module.get<WorkerAbsencesService>(WorkerAbsencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
