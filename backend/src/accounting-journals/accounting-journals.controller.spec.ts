import { Test, TestingModule } from '@nestjs/testing';
import { AccountingJournalsController } from './accounting-journals.controller';

describe('AccountingJournalsController', () => {
  let controller: AccountingJournalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountingJournalsController],
    }).compile();

    controller = module.get<AccountingJournalsController>(AccountingJournalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
