import { Test, TestingModule } from '@nestjs/testing';
import { PayrollGroupVariablesController } from './payroll-group-variables.controller';

describe('PayrollGroupVariablesController', () => {
  let controller: PayrollGroupVariablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollGroupVariablesController],
    }).compile();

    controller = module.get<PayrollGroupVariablesController>(PayrollGroupVariablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
