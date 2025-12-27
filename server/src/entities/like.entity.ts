import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Murmur } from './murmur.entity';

@Entity()
@Unique(['userId', 'murmurId'])
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  murmurId!: number;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Murmur, (murmur) => murmur.likes)
  @JoinColumn({ name: 'murmurId' })
  murmur!: Murmur;

  @CreateDateColumn()
  createdAt!: Date;
}

