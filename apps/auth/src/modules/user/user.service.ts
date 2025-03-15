import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
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
      throw new ConflictException('Email already exists');
    }
    if (existingStudentId) {
      throw new ConflictException('Student ID already exists');
    }

    return this.userRepository.save(user);
  }
}
