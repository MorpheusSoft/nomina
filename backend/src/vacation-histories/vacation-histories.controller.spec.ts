import { Test, TestingModule } from '@nestjs/testing';
import { VacationHistoriesController } from './vacation-histories.controller';

describe('VacationHistoriesController', () => {
  let controller: VacationHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VacationHistoriesController],
    }).compile();

    controller = module.get<VacationHistoriesController>(VacationHistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
