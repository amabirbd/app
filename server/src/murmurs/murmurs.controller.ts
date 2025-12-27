import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MurmursService } from './murmurs.service';
import { CreateMurmurDto } from './dto/create-murmur.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api')
export class MurmursController {
  constructor(private readonly murmursService: MurmursService) {}

  @Get('murmurs')
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    return this.murmursService.findAll(page, limit);
  }

  @Get('murmurs/:id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.murmursService.findOne(+id);
  }

  @Post('me/murmurs')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createMurmurDto: CreateMurmurDto, @Request() req: any): Promise<any> {
    const userId = req.user.id;
    const murmur = await this.murmursService.create(createMurmurDto, userId);
    return this.murmursService.findOne(murmur.id);
  }

  @Delete('me/murmurs/:id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.murmursService.remove(+id, userId);
    return { message: 'Murmur deleted successfully' };
  }

  @Get('timeline')
  @UseGuards(JwtAuthGuard)
  async getTimeline(
    @Query() paginationDto: PaginationDto,
    @Request() req: any,
  ): Promise<PaginatedResponseDto<any>> {
    const userId = req.user.id;
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    return this.murmursService.getTimeline(userId, page, limit);
  }
}

