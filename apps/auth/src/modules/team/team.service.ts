import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { In, Repository } from 'typeorm';
import { CreateTeamDTO } from './dto/create-team.dto';
import { RpcException } from '@nestjs/microservices';
import { createGRPCErrorResponse } from '../../libs/response.lib';
import { User, UserRole } from '../user/entities/user.entity';
import { UpdateTeamDTO } from './dto/update-team.dto';
import { AddTeamMembersDTO } from './dto/add-team-members.dto';
import { MoveUserInTeamsDTO } from './dto/move-user-in-teams.dto';
import { TransferTeamSuperAdminDTO } from './dto/transfer-team-super-admin.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createTeam(dto: CreateTeamDTO) {
    const existingTeam = await this.teamRepository.findOne({
      where: { name: dto.name },
    });
    if (existingTeam)
      throw new RpcException(
        createGRPCErrorResponse(
          'TEAM_ALREADY_EXISTS',
          `团队名称「 ${dto.name} 」已存在`,
        ),
      );

    const superAdmin = await this.userRepository.findOne({
      where: { id: dto.super_admin_user_id },
    });

    if (!superAdmin) {
      throw new RpcException(
        createGRPCErrorResponse('USER_NOT_FOUND', '用户不存在'),
      );
    }

    let members: User[] = [];
    if (dto.members.length > 0) {
      members = await this.userRepository.find({
        where: { id: In(dto.members) },
      });

      // 验证是否所有成员都存在
      if (members.length !== dto.members.length) {
        throw new RpcException(
          createGRPCErrorResponse('USER_NOT_FOUND', '一个或多个团队成员不存在'),
        );
      }
    }

    try {
      // 开始事务
      await this.userRepository.manager.transaction(async () => {
        // 创建团队
        const team = this.teamRepository.create({
          name: dto.name,
          description: dto.description,
        });

        const savedTeam = await this.teamRepository.save(team);

        // 设置团队管理员角色和关联的团队（
        superAdmin.role = UserRole.EXTERNAL_SUPER_ADMIN;
        superAdmin.team = savedTeam;
        await this.userRepository.save(superAdmin);

        // 添加成员到团队
        if (members.length > 0) {
          for (const member of members) {
            member.team = savedTeam;
            member.role = UserRole.EXTERNAL_MEMBER; // 默认为团队成员
          }
          await this.userRepository.save(members);
        }

        // 创建成功
        const teamWithMembers = await this.teamRepository.findOne({
          where: { id: savedTeam.id },
          relations: ['members'],
        });

        return {
          success: true,
          message: '团队创建成功',
          data: teamWithMembers,
        };
      });
    } catch (error) {
      // 发生错误，回滚事务
      throw new RpcException(
        createGRPCErrorResponse(
          'CREATE_TEAM_FAILURE',
          (error as Error).message || '创建团队失败',
        ),
      );
    }
  }

  async findAll() {
    return this.teamRepository.find({
      relations: ['members'],
    });
  }

  async findOne(id: string) {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!team) {
      throw new RpcException(
        createGRPCErrorResponse('TEAM_NOT_FOUND', '团队未找到'),
      );
    }

    return team;
  }

  async updateTeam(dto: UpdateTeamDTO) {
    const team = await this.teamRepository.findOne({ where: { id: dto.id } });

    if (!team) {
      throw new RpcException(
        createGRPCErrorResponse('TEAM_NOT_FOUND', '团队未找到'),
      );
    }

    if (dto.name && dto.name !== team.name) {
      const existingTeam = await this.teamRepository.findOne({
        where: { name: dto.name },
      });

      if (existingTeam) {
        throw new RpcException(
          createGRPCErrorResponse('TEAM_NAME_EXISTS', '团队名已存在'),
        );
      }
    }

    // 更新团队信息
    if (dto.name) team.name = dto.name;
    if (dto.description !== undefined) team.description = dto.description;
  }

  async deleteTeam(id: string) {
    const team = await this.findOne(id);

    // 先将所有成员从团队中移除（设置team为null）
    for (const member of team.members) {
      member.team = null;
      await this.userRepository.save(member);
    }

    // 删除团队
    await this.teamRepository.remove(team);
  }

  async addTeamMembers({ teamId, usersId = [] }: AddTeamMembersDTO) {
    if (usersId.length === 0) {
      throw new RpcException(
        createGRPCErrorResponse('NO_USERS', '没有选择用户'),
      );
    }

    // 检查团队是否存在
    const team = await this.findOne(teamId);
    if (!team) {
      throw new RpcException(createGRPCErrorResponse('NO_TEAM', '团队不存在'));
    }

    // 检查是不是所有用户都存在
    const users = await this.userRepository.find({
      where: { id: In(usersId) },
      relations: ['team'],
    });

    if (usersId.length !== users.length) {
      const foundUserIds = users.map((user) => user.id);
      const missingUserIds = usersId.filter((id) => !foundUserIds.includes(id));

      throw new RpcException(
        createGRPCErrorResponse(
          'MISSING_USERS',
          `缺少用户: ${missingUserIds.join(',')}`,
        ),
      );
    }

    // 事务操作
    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const addedUsers: User[] = [];
        const errors: string[] = [];

        for (const user of users) {
          try {
            if (user.team) {
              // 检查用户是不是已经在团队中
              if (user.team.id === teamId) {
                errors.push(`用户 「${user.name}」已经在团队中。`);
                continue;
              } else {
                errors.push(
                  `用户 「${user.name}」已经在其他团队 「${user.team.name}」中，不可再同时加入其他团队`,
                );
                continue;
              }
            }

            // 设置用户团队和角色
            user.team = team;
            user.role = UserRole.EXTERNAL_MEMBER; // 默认为团队普通成员

            // 保存用户
            const savedUser = await transactionalEntityManager.save(User, user);
            addedUsers.push(savedUser);
          } catch {
            errors.push(`添加用户「${user.name}」失败`);
          }
        }

        const message = {
          success: '',
          error: errors,
        }; // 响应信息
        if (addedUsers.length > 0) {
          message.success = `成功添加 ${addedUsers.length} 名用户到团队`;
        }

        return {
          success: addedUsers.length > 0,
          message,
          addedUsers,
        };
      },
    );
  }

  async removeTeamMember(teamId: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new RpcException(
        createGRPCErrorResponse('USER_NOT_FOUND', '用户不存在'),
      );
    }

    user.team = null;

    await this.userRepository.save(user);

    return {
      success: true,
      message: `用户 ${user.name} 已从团队中删除`,
    };
  }

  async moveUserToAnotherTeam({
    userId,
    sourceTeamId,
    targetTeamId,
  }: MoveUserInTeamsDTO) {
    const user = await this.userRepository.findOne({
      where: { id: userId, team: { id: sourceTeamId } },
      relations: ['team'],
    });

    if (!user) {
      throw new RpcException(
        createGRPCErrorResponse('USER_NOT_FOUND', '用户不存在'),
      );
    }

    const prevTeam = user.team;

    const targetTeam = await this.teamRepository.findOne({
      where: { id: targetTeamId },
    });

    if (!targetTeamId) {
      throw new RpcException(
        createGRPCErrorResponse('TEAM_NOT_FOUND', '目标团队不存在'),
      );
    }

    user.team = targetTeam;

    await this.userRepository.save(user);

    return {
      success: true,
      message: `用户 ${user.name} 已从 ${prevTeam?.name} 团队转移到 ${targetTeam?.name} 团队`,
    };
  }

  async transferTeamSuerAdmin(dto: TransferTeamSuperAdminDTO) {
    const { teamId, currentSuperAdminUserId, newSuperAdminUserId } = dto;

    // 检查团队是否存在
    const team = await this.teamRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new RpcException(
        createGRPCErrorResponse('TEAM_NOT_FOUND', '团队不存在'),
      );
    }

    let isInternal = false;
    if (team.name === '乐程软件工作室') {
      isInternal = true;
    }

    // 检查当前超管
    const curSuperAdmin = await this.userRepository.findOne({
      where: {
        id: currentSuperAdminUserId,
        role: In([
          UserRole.EXTERNAL_SUPER_ADMIN,
          UserRole.INTERNAL_SUPER_ADMIN,
        ]),
        team: { id: teamId },
      },
    });

    if (!curSuperAdmin) {
      throw new RpcException(
        createGRPCErrorResponse(
          'CURRENT_SUPER_ADMIN_NOT_FOUND',
          '当前用户非超管或不存在',
        ),
      );
    }

    const newSuperAdmin = await this.userRepository.findOne({
      where: { id: newSuperAdminUserId, team: { id: teamId } },
    });

    if (!newSuperAdmin) {
      throw new RpcException(
        createGRPCErrorResponse('USER_NOT_FOUND', '新超管不在团队中或不存在'),
      );
    }

    // 转让超管权限
    curSuperAdmin.role = isInternal
      ? UserRole.INTERNAL_MEMBER
      : UserRole.EXTERNAL_MEMBER; // 原超管降为普通成员
    newSuperAdmin.role = isInternal
      ? UserRole.INTERNAL_SUPER_ADMIN
      : UserRole.EXTERNAL_SUPER_ADMIN; // 将新用户升级为超管

    await this.userRepository.save([curSuperAdmin, newSuperAdmin]);

    return {
      success: true,
      message: `团队超管已从「${curSuperAdmin.name}」成功转移到 「${newSuperAdmin.name}」`,
    };
  }
}
