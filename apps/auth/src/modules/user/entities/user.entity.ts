import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from '../../team/entities/team.entity';

export enum UserRole {
  INTERNAL_MEMBER = 'internal_member', // 团队内部成员
  INTERNAL_ADMIN = 'internal_admin', // 团队内管理员
  INTERNAL_SUPER_ADMIN = 'internal_super_admin', // 团队内超管

  EXTERNAL_MEMBER = 'external_member', // 外部团队用户
  EXTERNAL_ADMIN = 'external_admin', // 外部团队管理员
  EXTERNAL_SUPER_ADMIN = 'external_super_admin', // 外部团队超管

  REGULAR_USER = 'regular_user', // 一般用户
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  studentId: string;

  @Column({
    comment: '用户的真实姓名，内部系统内是必要参数',
    nullable: true,
  })
  name: string;

  @Column()
  nickname: string;

  @Column()
  grade: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.REGULAR_USER,
  })
  role: UserRole;

  @ManyToOne(() => Team, (team) => team.members, { nullable: true })
  team: Team | null;

  @Column()
  salt: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
