import { Test, TestingModule } from '@nestjs/testing';
import { BankFileTemplatesService } from './bank-file-templates.service';

describe('BankFileTemplatesService', () => {
  let service: BankFileTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankFileTemplatesService],
    }).compile();

    service = module.get<BankFileTemplatesService>(BankFileTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
