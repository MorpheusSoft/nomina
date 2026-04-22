import { Test, TestingModule } from '@nestjs/testing';
import { PayrollGroupVariablesService } from './payroll-group-variables.service';

describe('PayrollGroupVariablesService', () => {
  let service: PayrollGroupVariablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollGroupVariablesService],
    }).compile();

    service = module.get<PayrollGroupVariablesService>(PayrollGroupVariablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
