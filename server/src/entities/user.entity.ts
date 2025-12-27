import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Murmur } from './murmur.entity';
import { Like } from './like.entity';
import { Follow } from './follow.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  password!: string | null;

  @OneToMany(() => Murmur, (murmur) => murmur.author)
  murmurs!: Murmur[];

  @OneToMany(() => Like, (like) => like.user)
  likes!: Like[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  followers!: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  following!: Follow[];
}
