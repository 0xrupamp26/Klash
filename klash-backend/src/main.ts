import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // Load and validate environment variables
    const configService = new ConfigService();
    validateEnv(process.env);

    const app = await NestFactory.create(AppModule);
    const port = configService.get<number>('PORT', 3000);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:8080');

    // Enhanced CORS configuration
    const corsOrigins = nodeEnv === 'production' 
      ? [frontendUrl, 'https://your-production-domain.com']
      : [frontendUrl, 'http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080'];

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    });

    app.setGlobalPrefix('api');

    // Global validation pipe with enhanced options
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      const { method, url, ip } = req;
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        
        if (nodeEnv === 'development') {
          logger.log(`${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`);
        }
      });
      
      next();
    });

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Klash API')
      .setDescription('Klash API Documentation - Decentralized Prediction Markets')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('markets', 'Market operations')
      .addTag('bets', 'Betting operations')
      .addTag('auth', 'Authentication')
      .addTag('resolution', 'Market resolution')
      .addServer(`http://localhost:${port}/api`, 'Development server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Health check endpoint
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    await app.listen(port);
    logger.log(`🚀 Server running on port ${port} in ${nodeEnv} mode`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`🔗 CORS enabled for origins: ${corsOrigins.join(', ')}`);
    
  } catch (error) {
    logger.error('❌ Error starting server', error);
    process.exit(1);
  }
}

bootstrap();
