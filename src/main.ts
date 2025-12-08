import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';


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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
