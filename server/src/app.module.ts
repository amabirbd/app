import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Murmur } from './entities/murmur.entity';
import { Like } from './entities/like.entity';
import { Follow } from './entities/follow.entity';
import { UsersModule } from './users/users.module';
import { MurmursModule } from './murmurs/murmurs.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'docker',
      password: 'docker',
      database: 'test',
      entities: [User, Murmur, Like, Follow],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
    MurmursModule,
    LikesModule,
    FollowsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
