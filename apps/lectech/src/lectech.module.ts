import { Module } from '@nestjs/common';
import { LectechController } from './lectech.controller';
import { LectechService } from './lectech.service';

@Module({
  imports: [],
  controllers: [LectechController],
  providers: [LectechService],
})
export class LectechModule {}
