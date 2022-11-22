import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserAuthority } from './user-authority.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'username',  nullable: true, length: 45 })
  username: string;

  @Column('varchar', { name: 'password',  nullable: true, length: 200 })
  password: string;

  @Column('varchar', { name: 'kakao_id',  nullable: true, length: 45 })
  kakaoId: string;

  @Column('varchar', { name: 'email',  nullable: true, length: 100 })
  email: string;

  @Column('varchar', { name: 'name', nullable: true, length: 45 })
  name: string | null;

  @Column('varchar', { name: 'gender', nullable: true, length: 10 })
  gender: string;

  @Column('varchar', { name: 'phone', nullable: true, length: 20 })
  phone: string;

  @Column('varchar', { name: 'birth', nullable: true, length: 10 })
  birth: string;

  @Column('varchar', { name: 'profile_image', nullable: true, length: 200 })
  profileImage: string | null;

  @Column('timestamp', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('timestamp', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @OneToMany(() => UserAuthority, (userAuthority) => userAuthority.user, {
    eager: true,
  })
  authorities?: any[];
}
