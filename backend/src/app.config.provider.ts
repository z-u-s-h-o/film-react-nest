import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

export const configProvider = {
  provide: 'CONFIG',
  useFactory: (configService: ConfigService) => {
    return {
      database: {
        driver: configService.get<string>('DATABASE_TYPE'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT', { infer: true }),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        name: configService.get<string>('DATABASE_NAME'),
      },
    } as AppConfig;
  },
  inject: [ConfigService],
};
