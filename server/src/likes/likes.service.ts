import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { Murmur } from '../entities/murmur.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Murmur)
    private murmurRepository: Repository<Murmur>,
  ) {}

  async like(murmurId: number, userId: number): Promise<{ likeCount: number }> {
    // Check if murmur exists
    const murmur = await this.murmurRepository.findOne({
      where: { id: murmurId },
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${murmurId} not found`);
    }

    // Check if already liked
    const existingLike = await this.likeRepository.findOne({
      where: { murmurId, userId },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this murmur');
    }

    // Create like
    const like = this.likeRepository.create({ murmurId, userId });
    await this.likeRepository.save(like);

    const likeCount = await this.getLikeCount(murmurId);
    return { likeCount };
  }

  async unlike(
    murmurId: number,
    userId: number,
  ): Promise<{ likeCount: number }> {
    const like = await this.likeRepository.findOne({
      where: { murmurId, userId },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(like);

    const likeCount = await this.getLikeCount(murmurId);
    return { likeCount };
  }

  async hasLiked(murmurId: number, userId: number): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { murmurId, userId },
    });
    return !!like;
  }

  async getLikeCount(murmurId: number): Promise<number> {
    return this.likeRepository.count({
      where: { murmurId },
    });
  }
}

