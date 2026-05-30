import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configProvider } from './app.config.provider';
import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
      serveStaticOptions: {
        index: false,
      },
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: config.get<string>('DATABASE_DRIVER') as 'postgres',
        url: config.get<string>('DATABASE_URL'),
        username: config.get<string>('DATABASE_USERNAME'),
        password: String(config.get('DATABASE_PASSWORD')),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),

    FilmsModule,
    OrderModule,
  ],
  providers: [configProvider],
  exports: [configProvider],
})
export class AppModule {}
