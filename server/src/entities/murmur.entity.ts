import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Like } from './like.entity';

@Entity()
export class Murmur {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  text!: string;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.murmurs)
  @JoinColumn({ name: 'userId' })
  author!: User;

  @OneToMany(() => Like, (like) => like.murmur)
  likes!: Like[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

