import { Module } from '@nestjs/common';
import { TeamService } from './team.service';

@Module({
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
