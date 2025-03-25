import { Body, Controller } from '@nestjs/common';
import { TeamService } from './team.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateTeamDTO } from './dto/create-team.dto';
import { UpdateTeamDTO } from './dto/update-team.dto';
import { AddTeamMembersDTO } from './dto/add-team-members.dto';
import { MoveUserInTeamsDTO } from './dto/move-user-in-teams.dto';
import { TransferTeamSuperAdminDTO } from './dto/transfer-team-super-admin.dto';

@Controller()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @GrpcMethod('TeamService', 'CreateTeam')
  createTeam(@Body() createTeamDto: CreateTeamDTO) {
    return this.teamService.createTeam(createTeamDto);
  }

  @GrpcMethod('TeamService', 'GetTeams')
  async getTeams() {
    return this.teamService.findAll();
  }

  @GrpcMethod('TeamService', 'GetTeam')
  async getTeam(@Body('team_id') id: string) {
    return this.teamService.findOne(id);
  }

  @GrpcMethod('TeamService', 'UpdateTeam')
  async updateTeam(@Body() dto: UpdateTeamDTO) {
    return this.teamService.updateTeam(dto);
  }

  @GrpcMethod('TeamService', 'DeleteTeam')
  async deleteTeam(@Body('team_id') id: string) {
    return this.teamService.deleteTeam(id);
  }

  @GrpcMethod('TeamsService', 'AddTeamMembers')
  async addTeamMembers(@Body() dto: AddTeamMembersDTO) {
    return this.teamService.addTeamMembers(dto);
  }

  @GrpcMethod('TeamsService', 'RemoveTeamMember')
  async removeTeamMember(
    @Body('teamId') teamId: string,
    @Body('userId') userId: string,
  ) {
    return this.teamService.removeTeamMember(teamId, userId);
  }

  @GrpcMethod('TeamsService', 'MoveUserToAnotherTeam')
  async moveUserToAnotherTeam(@Body() dto: MoveUserInTeamsDTO) {
    return this.teamService.moveUserToAnotherTeam(dto);
  }

  @GrpcMethod('TeamService', 'TransferTeamOwnerShip')
  async transferOwnership(@Body() dto: TransferTeamSuperAdminDTO) {
    return this.teamService.transferTeamSuerAdmin(dto);
  }
}
