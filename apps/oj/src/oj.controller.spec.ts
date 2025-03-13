import { Test, TestingModule } from '@nestjs/testing';
import { OjController } from './oj.controller';
import { OjService } from './oj.service';

describe('OjController', () => {
  let ojController: OjController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OjController],
      providers: [OjService],
    }).compile();

    ojController = app.get<OjController>(OjController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ojController.getHello()).toBe('Hello World!');
    });
  });
});
