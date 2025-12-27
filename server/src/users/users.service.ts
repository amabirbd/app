import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { Murmur } from '../entities/murmur.entity';
import { UserStatsDto } from './dto/user-stats.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(Murmur)
    private murmurRepository: Repository<Murmur>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getUserStats(userId: number, currentUserId?: number): Promise<UserStatsDto> {
    const user = await this.findOne(userId);

    const followersCount = await this.followRepository.count({
      where: { followingId: userId },
    });

    const followingCount = await this.followRepository.count({
      where: { followerId: userId },
    });

    const murmursCount = await this.murmurRepository.count({
      where: { userId },
    });

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.followRepository.findOne({
        where: { followerId: currentUserId, followingId: userId },
      });
      isFollowing = !!follow;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      followersCount,
      followingCount,
      murmursCount,
      isFollowing,
    };
  }
}

