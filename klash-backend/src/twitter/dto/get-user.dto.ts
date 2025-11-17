import { IsString, MinLength } from 'class-validator';

export class GetUserDto {
  @IsString()
  @MinLength(1, { message: 'Username must not be empty' })
  username: string;
}
