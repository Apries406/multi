import { Controller, Get } from '@nestjs/common';
import { LectechService } from './lectech.service';

@Controller()
export class LectechController {
  constructor(private readonly lectechService: LectechService) {}

  @Get()
  getHello(): string {
    return this.lectechService.getHello();
  }
}
