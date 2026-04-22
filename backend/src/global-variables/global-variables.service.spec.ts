import { Test, TestingModule } from '@nestjs/testing';
import { GlobalVariablesService } from './global-variables.service';

describe('GlobalVariablesService', () => {
  let service: GlobalVariablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalVariablesService],
    }).compile();

    service = module.get<GlobalVariablesService>(GlobalVariablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
