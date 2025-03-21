import { Controller } from '@nestjs/common';
import { TeamService } from './team.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @GrpcMethod('TeamService', 'CreateTeam')
  async createTeam() {}

  @GrpcMethod('TeamService', 'GetTeams')
  async getTeams() {}

  @GrpcMethod('TeamService', 'GetTeam')
  async getTeam() {}

  @GrpcMethod('TeamService', 'UpdateTeam')
  async updateTeam() {}

  @GrpcMethod('TeamService', 'DeleteTeam')
  async deleteTeam() {}

  @GrpcMethod('TeamsService', 'AddTeamMember')
  async addTeamMember() {}

  @GrpcMethod('TeamsService', 'RemoveTeamMember')
  async removeTeamMember() {}

  @GrpcMethod('TeamsService', 'MoveUserToAnotherTeam')
  async moveUserToAnotherTeam() {}
}
