import { Module } from '@nestjs/common';
import { DevLogger } from './dev-logger.service';
import { JsonLogger } from './json-logger.service';
import { TSKVLogger } from './tskv-logger.service';

@Module({
  providers: [DevLogger, JsonLogger, TSKVLogger],
  exports: [DevLogger, JsonLogger, TSKVLogger],
})
export class LoggerModule {}
