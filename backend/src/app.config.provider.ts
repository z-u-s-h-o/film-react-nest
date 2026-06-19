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
    const databaseDriver = configService.get<string>('DATABASE_DRIVER');
    const databaseHost = configService.get<string>('DATABASE_HOST');
    const databasePort = configService.get<string>('DATABASE_PORT');
    const databaseName = configService.get<string>('DATABASE_NAME');
    const databaseUsername = configService.get<string>('DATABASE_USERNAME');
    const databasePassword = configService.get<string>('DATABASE_PASSWORD');

    const databaseUrl = `postgres://${databaseUsername}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}`;

    return {
      database: {
        type: databaseDriver,
        url: databaseUrl,
        username: databaseUsername,
        password: databasePassword,
      },
    } as AppConfig;
  },
  inject: [ConfigService],
};
