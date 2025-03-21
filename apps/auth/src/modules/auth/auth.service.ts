import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDTO } from '../user/dto/register-user.dto';
import { User } from '../user/entities/user.entity';
import {
  encodePassword,
  generateSalt,
  verifyPassword,
} from '../../utils/encode';
import { LoginUserDTO } from '../user/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { createGRPCErrorResponse } from '../../libs/response.lib';
import { RpcException } from '@nestjs/microservices';

// 定义一个通用的 TokenPayload 接口，type 为联合类型
interface TokenPayload {
  studentId: string;
  sub: string;
  type: 'refresh' | 'access';
}

// 定义 RefreshTokenPayload 接口，继承自 TokenPayload 并明确 type 为 'refresh'
interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
}

// 定义 AccessTokenPayload 接口，继承自 TokenPayload 并明确 type 为 'access'，同时添加 role 属性
interface AccessTokenPayload extends TokenPayload {
  type: 'access';
  role: string;
}

type SafeUserInfo = Omit<User, 'password' | 'salt' | 'updateAt' | 'createAt'>;

function generateSafeUser(user: User): SafeUserInfo {
  return {
    id: user.id,
    email: user.email,
    studentId: user.studentId,
    name: user.name,
    nickname: user.nickname,
    grade: user.grade,
    role: user.role,
    team: user.team,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: RegisterUserDTO) {
    const user = new User();
    const user_salt = generateSalt();
    Object.assign(user, dto, {
      password: encodePassword(dto.password, user_salt),
      salt: user_salt,
      studentId: dto.studentId,
      grade: dto.studentId.slice(0, 4),
    });

    await this.userService.create(user);

    const tokens = this.generateTokens(user);
    return { ...tokens, user: generateSafeUser(user) };
  }

  async validateUser(dto: LoginUserDTO) {
    const user = await this.userService.findOneByStudentId(dto.studentId);

    if (user && verifyPassword(dto.password, user.salt, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    }

    return null;
  }

  private generateTokens(user: User) {
    const accessTokenPayload: AccessTokenPayload = {
      studentId: user.studentId,
      sub: user.id,
      role: user.role,
      type: 'access',
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      studentId: user.studentId,
      sub: user.id,
      type: 'refresh',
    };

    return {
      access_token: this.jwtService.sign(accessTokenPayload, {
        expiresIn: '7d',
      }),
      refresh_token: this.jwtService.sign(refreshTokenPayload, {
        expiresIn: '30m',
      }),
    };
  }

  async refreshTokens(refreshToken: string) {
    const payload: RefreshTokenPayload = this.jwtService.verify(refreshToken);

    if (payload.type !== 'refresh') {
      throw new RpcException(
        createGRPCErrorResponse('INVALID_TOKEN_TYPE', '验证令牌不合法'),
      );
    }

    const user = await this.userService.findOneByStudentId(payload.studentId);

    if (!user) {
      throw new RpcException(
        createGRPCErrorResponse('USER_NOT_FOUND', '用户不存在'),
      );
    }

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
    };
  }

  async login(dto: LoginUserDTO) {
    const user = await this.validateUser(dto);
    if (!user) {
      throw new RpcException(
        createGRPCErrorResponse('INVALID_TOKEN_TYPE', '验证令牌不合法'),
      );
    }

    const tokens = this.generateTokens(user as User);

    return {
      ...tokens,
      user,
    };
  }
}
