import { Test, TestingModule } from '@nestjs/testing';
import { GlobalVariablesController } from './global-variables.controller';

describe('GlobalVariablesController', () => {
  let controller: GlobalVariablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalVariablesController],
    }).compile();

    controller = module.get<GlobalVariablesController>(GlobalVariablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
