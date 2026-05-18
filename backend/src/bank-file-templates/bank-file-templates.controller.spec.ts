import { Test, TestingModule } from '@nestjs/testing';
import { BankFileTemplatesController } from './bank-file-templates.controller';

describe('BankFileTemplatesController', () => {
  let controller: BankFileTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankFileTemplatesController],
    }).compile();

    controller = module.get<BankFileTemplatesController>(BankFileTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
