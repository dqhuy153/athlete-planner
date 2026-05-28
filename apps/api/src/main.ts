import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

declare const globalThis: { _nestApp?: INestApplication };

export async function createNestApp(): Promise<INestApplication> {
  if (globalThis._nestApp) return globalThis._nestApp;

  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
    logger:
      process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
  });

  app.enableCors({
    origin: (
      process.env.CORS_ORIGINS ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000,http://localhost:3002'
    )
      .split(',')
      .map((s) => s.trim()),
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.setGlobalPrefix('api');

  await app.init();
  globalThis._nestApp = app;
  return app;
}

async function bootstrap() {
  const app = await createNestApp();
  const port = process.env.API_PORT || process.env.PORT || 3001;
  await app.listen(port);
  console.log(`API running on: http://localhost:${port}`);
}

if (!process.env.VERCEL) {
  bootstrap();
}
