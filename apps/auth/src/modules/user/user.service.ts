import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDTO } from './dto/register-user.dto';
import { encodePassword, generateSalt } from '../../utils/encode';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(dto: RegisterUserDTO) {
    const user = new User();
    const salt = generateSalt();
    Object.assign(user, dto, {
      password: encodePassword(dto.password, salt),
      salt,
      studentId: dto.student_id,
      grade: dto.student_id.slice(0, 4),
    });
    return this.userRepository.save(user);
  }
}
