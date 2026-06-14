import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { DevLogger } from './logger/dev-logger.service';
import { JsonLogger } from './logger/json-logger.service';
import { TSKVLogger } from './logger/tskv-logger.service';

type LoggerInstance = DevLogger | JsonLogger | TSKVLogger;

function createLogger(): LoggerInstance {
  const Logger =
    process.env.NODE_ENV === 'development'
      ? DevLogger
      : process.env.NODE_ENV === 'production'
        ? process.env.LOG_FORMAT === 'tskv'
          ? TSKVLogger
          : JsonLogger
        : DevLogger;

  return new Logger();
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = createLogger();
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api/afisha', {
    exclude: ['content/afisha'],
  });

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
