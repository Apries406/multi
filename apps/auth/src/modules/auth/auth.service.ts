import { Injectable, UnauthorizedException } from '@nestjs/common';
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
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: RegisterUserDTO) {
    try {
      const user = new User();
      const salt = generateSalt();
      Object.assign(user, dto, {
        password: encodePassword(dto.password, salt),
        salt,
        studentId: dto.studentId,
        grade: dto.studentId.slice(0, 4),
      });

      await this.userService.create(user);

      const { password, ...rest } = user;

      const tokens = this.generateTokens(rest);
      return { ...tokens, user: rest };
    } catch {
      throw new UnauthorizedException('Registration Failed');
    }
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

  private generateTokens(user: Omit<User, 'password'>) {
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
        expiresIn: '30m',
      }),
      refresh_token: this.jwtService.sign(refreshTokenPayload, {
        expiresIn: '7d',
      }),
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload: RefreshTokenPayload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid Token Type');
      }

      const user = await this.userService.findOneByStudentId(payload.studentId);

      if (!user) {
        throw new UnauthorizedException('User Not Found');
      }

      const { password, ...userInfo } = user;
      const tokens = this.generateTokens(userInfo);

      return {
        ...tokens,
        user: userInfo,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async login(dto: LoginUserDTO) {
    const user = await this.validateUser(dto);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }
}
