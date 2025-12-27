export class UserStatsDto {
  id!: number;
  name!: string;
  email!: string;
  followersCount!: number;
  followingCount!: number;
  murmursCount!: number;
  isFollowing?: boolean;
}

