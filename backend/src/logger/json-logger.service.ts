import { LoggerService, Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LogRotator } from './log-rotator.service';
import { LogMessage, LogContext, JsonLogEntry } from './logger.types';

@Injectable()
export class JsonLogger implements LoggerService {
  private currentLogFile: string;
  private rotator: LogRotator;

  constructor() {
    const logsDir = path.join(process.cwd(), 'logs');
    this.rotator = new LogRotator(logsDir, 10 * 1024 * 1024);
    this.currentLogFile = this.rotator.getRotatedFilePath('app-json');
  }

  private formatMessage(
    level: string,
    message: LogMessage,
    context?: LogContext,
    stack?: string,
  ): string {
    let formattedMessage: any = message;

    if (message instanceof Error) {
      formattedMessage = {
        message: message.message,
        stack: message.stack || stack,
      };
    }

    const logEntry: JsonLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || 'Unknown',
      stack: stack || (message instanceof Error ? message.stack : null),
      message: formattedMessage,
    };

    return JSON.stringify(logEntry);
  }

  private writeToFile(message: string): void {
    this.currentLogFile = this.rotator.rotateIfNeeded(
      this.currentLogFile,
      'app-json',
    );

    try {
      fs.appendFileSync(this.currentLogFile, message + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
      console.log(message);
    }
  }

  log(message: LogMessage, context?: LogContext) {
    this.writeToFile(this.formatMessage('log', message, context));
  }

  error(message: LogMessage, stack?: string, context?: LogContext) {
    this.writeToFile(this.formatMessage('error', message, context, stack));
  }

  warn(message: LogMessage, context?: LogContext) {
    this.writeToFile(this.formatMessage('warn', message, context));
  }

  debug(message: LogMessage, context?: LogContext) {
    this.writeToFile(this.formatMessage('debug', message, context));
  }

  verbose(message: LogMessage, context?: LogContext) {
    this.writeToFile(this.formatMessage('verbose', message, context));
  }
}
