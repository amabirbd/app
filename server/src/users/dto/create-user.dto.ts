import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

