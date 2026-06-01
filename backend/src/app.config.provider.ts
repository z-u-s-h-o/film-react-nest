import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  type: string;
  url: string;
  username: string;
  password: string;
}

export const configProvider = {
  provide: 'CONFIG',
  useFactory: (configService: ConfigService) => {
    return {
      database: {
        type: configService.get<string>('DATABASE_DRIVER'),
        url: configService.get<string>('DATABASE_URL'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
      },
    } as AppConfig;
  },
  inject: [ConfigService],
};
