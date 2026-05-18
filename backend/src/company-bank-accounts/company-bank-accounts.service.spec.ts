import { Test, TestingModule } from '@nestjs/testing';
import { CompanyBankAccountsService } from './company-bank-accounts.service';

describe('CompanyBankAccountsService', () => {
  let service: CompanyBankAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyBankAccountsService],
    }).compile();

    service = module.get<CompanyBankAccountsService>(CompanyBankAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
