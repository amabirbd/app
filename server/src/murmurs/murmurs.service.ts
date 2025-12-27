import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Like } from '../entities/like.entity';
import { Follow } from '../entities/follow.entity';
import { CreateMurmurDto } from './dto/create-murmur.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class MurmursService {
  constructor(
    @InjectRepository(Murmur)
    private murmurRepository: Repository<Murmur>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async create(createMurmurDto: CreateMurmurDto, userId: number): Promise<Murmur> {
    const murmur = this.murmurRepository.create({
      text: createMurmurDto.text,
      userId: userId,
    });
    return this.murmurRepository.save(murmur);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResponseDto<any>> {
    const [data, total] = await this.murmurRepository.findAndCount({
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const murmursWithLikes = await Promise.all(
      data.map(async (murmur) => {
        const likeCount = await this.getLikeCount(murmur.id);
        return this.formatMurmurResponse(murmur, likeCount);
      }),
    );

    return {
      data: murmursWithLikes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<any> {
    const murmur = await this.murmurRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${id} not found`);
    }

    const likeCount = await this.getLikeCount(id);
    return this.formatMurmurResponse(murmur, likeCount);
  }

  async findByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResponseDto<any>> {
    const [data, total] = await this.murmurRepository.findAndCount({
      where: { userId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const murmursWithLikes = await Promise.all(
      data.map(async (murmur) => {
        const likeCount = await this.getLikeCount(murmur.id);
        return this.formatMurmurResponse(murmur, likeCount);
      }),
    );

    return {
      data: murmursWithLikes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async remove(id: number, userId: number): Promise<void> {
    const murmur = await this.murmurRepository.findOne({
      where: { id },
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${id} not found`);
    }

    if (murmur.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own murmurs',
      );
    }

    await this.murmurRepository.remove(murmur);
  }

  async getLikeCount(murmurId: number): Promise<number> {
    return this.likeRepository.count({
      where: { murmurId },
    });
  }

  async getTimeline(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResponseDto<any>> {
    // Get all users that the current user follows
    const follows = await this.followRepository.find({
      where: { followerId: userId },
    });

    const followingIds = follows.map((follow) => follow.followingId);

    if (followingIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Get murmurs from followed users
    const [data, total] = await this.murmurRepository.findAndCount({
      where: { userId: In(followingIds) },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const murmursWithLikes = await Promise.all(
      data.map(async (murmur) => {
        const likeCount = await this.getLikeCount(murmur.id);
        return this.formatMurmurResponse(murmur, likeCount);
      }),
    );

    return {
      data: murmursWithLikes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private formatMurmurResponse(murmur: Murmur, likeCount: number): any {
    return {
      id: murmur.id,
      text: murmur.text,
      userId: murmur.userId,
      author: murmur.author
        ? {
            id: murmur.author.id,
            name: murmur.author.name,
            email: murmur.author.email,
          }
        : null,
      likeCount,
      createdAt: murmur.createdAt,
      updatedAt: murmur.updatedAt,
    };
  }
}

