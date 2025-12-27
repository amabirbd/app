import {
  Controller,
  Post,
  Delete,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/murmurs')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async like(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ likeCount: number }> {
    const userId = req.user.id;
    return this.likesService.like(+id, userId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  async unlike(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ likeCount: number }> {
    const userId = req.user.id;
    return this.likesService.unlike(+id, userId);
  }
}

