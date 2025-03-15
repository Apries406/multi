import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  studentId: string;

  name?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  nickname: string;
}
