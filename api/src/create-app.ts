import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AbstractHttpAdapter, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/** Shared by src/main.ts (local server) and api/index.ts (Vercel serverless handler). */
export async function createApp(httpAdapter?: AbstractHttpAdapter): Promise<INestApplication> {
  const app = httpAdapter ? await NestFactory.create(AppModule, httpAdapter) : await NestFactory.create(AppModule);

  app.enableCors({ origin: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Small Web API')
    .setDescription('Sites, people, visits and search for the small web browser.')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  return app;
}
