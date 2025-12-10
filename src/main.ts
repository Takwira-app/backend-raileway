import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

// 👉 Add these imports
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,  { logger: ['error', 'warn', 'log', 'debug'] });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, 
  }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*', 
    credentials: false,
  });

  // 👉 Add this block for Swagger
  const config = new DocumentBuilder()
    .setTitle('Takwira API')
    .setDescription('API documentation for your football booking app')
    .setVersion('1.0')
    .addBearerAuth()  // if you're using JWT Auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
