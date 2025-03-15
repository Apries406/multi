import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod } from '@nestjs/microservices';
import { RegisterUserDTO } from '../user/dto/register-user.dto';
import { LoginUserDTO } from '../user/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(dto: RegisterUserDTO) {
    return await this.authService.create(dto);
  }

  @GrpcMethod('AuthService', 'Login')
  login(dto: LoginUserDTO) {
    return this.authService.login(dto);
  }

  @GrpcMethod('AuthService', 'RefreshTokens')
  async refreshTokens({ refresh_token }: { refresh_token: string }) {
    return this.authService.refreshTokens(refresh_token);
  }
}
