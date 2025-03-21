import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { createGRPCErrorResponse } from '../../libs/response.lib';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findOneByStudentId(studentId: string) {
    return this.userRepository.findOne({ where: { studentId } });
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(user: Partial<User>) {
    const [existingEmail, existingStudentId] = await Promise.all([
      this.findOneByEmail(user.email as string),
      this.findOneByStudentId(user.studentId as string),
    ]);

    if (existingEmail) {
      throw new RpcException(
        createGRPCErrorResponse('EMAIL_ALREADY_EXISTS', '邮箱已存在'),
      );
    }

    if (existingStudentId) {
      throw new RpcException(
        createGRPCErrorResponse('STUDENT_ID_ALREADY_EXISTS', '学号已存在'),
      );
    }

    return this.userRepository.save(user);
  }
}
