import { Test, TestingModule } from '@nestjs/testing';
import { LectechController } from './lectech.controller';
import { LectechService } from './lectech.service';

describe('LectechController', () => {
  let lectechController: LectechController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LectechController],
      providers: [LectechService],
    }).compile();

    lectechController = app.get<LectechController>(LectechController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(lectechController.getHello()).toBe('Hello World!');
    });
  });
});
