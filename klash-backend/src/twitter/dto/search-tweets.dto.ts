import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class SearchTweetsDto {
  @IsString()
  @Min(1, { message: 'Query must not be empty' })
  query: string;

  @IsNumber()
  @Min(1)
  @Max(200)
  @IsOptional()
  count?: number = 100;
}
