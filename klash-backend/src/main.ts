import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // Load and validate environment variables
    const configService = new ConfigService();
    validateEnv(process.env);

    const app = await NestFactory.create(AppModule);
    const port = configService.get<number>('PORT', 3000);

    // Enable CORS with specific frontend origin
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:8080',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.setGlobalPrefix('api');

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Klash API')
      .setDescription('Klash API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(port);
    logger.log(`🚀 Server running on port ${port} in ${configService.get('NODE_ENV')} mode`);
  } catch (error) {
    logger.error('❌ Error starting server', error);
    process.exit(1);
  }
}

bootstrap();
