import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateMurmurDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text!: string;
}

