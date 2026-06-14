import { Injectable, ConsoleLogger } from '@nestjs/common';
import { LogMessage, LogContext } from './logger.types';

@Injectable()
export class DevLogger extends ConsoleLogger {
  log(message: LogMessage, context?: LogContext): void {
    super.log(message, context);
  }

  error(message: LogMessage, stack?: string, context?: LogContext): void {
    super.error(message, stack, context);
  }

  warn(message: LogMessage, context?: LogContext): void {
    super.warn(message, context);
  }

  debug(message: LogMessage, context?: LogContext): void {
    super.debug(message, context);
  }

  verbose(message: LogMessage, context?: LogContext): void {
    super.verbose(message, context);
  }
}
