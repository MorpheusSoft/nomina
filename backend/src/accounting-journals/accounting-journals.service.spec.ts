import { Test, TestingModule } from '@nestjs/testing';
import { AccountingJournalsService } from './accounting-journals.service';

describe('AccountingJournalsService', () => {
  let service: AccountingJournalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingJournalsService],
    }).compile();

    service = module.get<AccountingJournalsService>(AccountingJournalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
