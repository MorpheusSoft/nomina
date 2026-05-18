import { Test, TestingModule } from '@nestjs/testing';
import { CompanyBankAccountsController } from './company-bank-accounts.controller';

describe('CompanyBankAccountsController', () => {
  let controller: CompanyBankAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyBankAccountsController],
    }).compile();

    controller = module.get<CompanyBankAccountsController>(CompanyBankAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
