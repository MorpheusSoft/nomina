import { Test, TestingModule } from '@nestjs/testing';
import { FamilyMembersController } from './family-members.controller';

describe('FamilyMembersController', () => {
  let controller: FamilyMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FamilyMembersController],
    }).compile();

    controller = module.get<FamilyMembersController>(FamilyMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
