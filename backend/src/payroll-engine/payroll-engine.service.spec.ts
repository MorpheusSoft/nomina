import { Test, TestingModule } from '@nestjs/testing';
import { PayrollEngineService } from './payroll-engine.service';

describe('PayrollEngineService', () => {
  let service: PayrollEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollEngineService],
    }).compile();

    service = module.get<PayrollEngineService>(PayrollEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
