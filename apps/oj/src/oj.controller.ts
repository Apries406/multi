import { Controller, Get } from '@nestjs/common';
import { OjService } from './oj.service';

@Controller()
export class OjController {
  constructor(private readonly ojService: OjService) {}

  @Get()
  getHello(): string {
    return this.ojService.getHello();
  }
}
