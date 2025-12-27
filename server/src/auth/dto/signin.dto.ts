import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SigninDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

