import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async follow(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.followsService.follow(userId, +id);
    return { message: 'User followed successfully' };
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  async unfollow(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.followsService.unfollow(userId, +id);
    return { message: 'User unfollowed successfully' };
  }

  @Get(':id/follow-status')
  @UseGuards(JwtAuthGuard)
  async getFollowStatus(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ isFollowing: boolean }> {
    const userId = req.user.id;
    const isFollowing = await this.followsService.isFollowing(userId, +id);
    return { isFollowing };
  }
}

