import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  TWITTER_API_KEY: string;

  @IsString()
  TWITTER_API_BASE_URL: string;

  @IsString()
  TWITTER_USER_ID: string;

  @IsString()
  TWITTER_IO_API_KEY: string;

  @IsString()
  TWITTER_IO_USER_ID: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation error: ${errors.toString()}`,
    );
  }
  
  return validatedConfig;
}
