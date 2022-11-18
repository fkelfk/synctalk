import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserAuthority } from './user-authority.entity';

@Entity('user')
export class UserEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(()=>UserAuthority, userAuthority => userAuthority.user, {eager: true})
  authorities?: any[];
}
