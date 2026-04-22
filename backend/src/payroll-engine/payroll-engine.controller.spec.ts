import { Test, TestingModule } from '@nestjs/testing';
import { PayrollEngineController } from './payroll-engine.controller';

describe('PayrollEngineController', () => {
  let controller: PayrollEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollEngineController],
    }).compile();

    controller = module.get<PayrollEngineController>(PayrollEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
