import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn({ name: 'user_id' })
	id: number;

	@Column({ name: 'email', type: 'varchar', length: 100, unique: true })
	email: string;

	@Column({ name: 'password', type: 'varchar', length: 255 })
	password: string;

	@Column({ name: 'full_name', type: 'varchar', length: 100, nullable: true })
	full_name?: string;

	@Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
	image_url?: string;

	@Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
	address?: string;

	@Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
	phone?: string;

	@Column({ name: 'dob', type: 'date', nullable: true })
	dob?: Date;

	@ManyToMany(() => Role, (role) => role.users)
	@JoinTable({
		name: 'users_roles',
		joinColumn: {
			name: 'user_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'role_name',
			referencedColumnName: 'role_name',
		},
	})
	roles?: Role[];
}
