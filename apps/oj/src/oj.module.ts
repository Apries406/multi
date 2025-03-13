import { Module } from '@nestjs/common';
import { OjController } from './oj.controller';
import { OjService } from './oj.service';

@Module({
  imports: [],
  controllers: [OjController],
  providers: [OjService],
})
export class OjModule {}
