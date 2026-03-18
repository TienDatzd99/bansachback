import {
  Column,
  Entity,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn({ name: 'role_name', type: 'varchar', length: 50 })
  role_name: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description?: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}