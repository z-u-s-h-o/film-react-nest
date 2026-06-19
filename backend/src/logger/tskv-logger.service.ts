import { LoggerService, Injectable } from '@nestjs/common';
import * as util from 'node:util';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LogRotator } from './log-rotator.service';
import { LogMessage, LogContext, TSKVLogEntry } from './logger.types';

@Injectable()
export class TSKVLogger implements LoggerService {
  private currentLogFile: string;
  private rotator: LogRotator;

  constructor() {
    const logsDir = path.join(process.cwd(), 'logs');
    this.rotator = new LogRotator(logsDir, 10 * 1024 * 1024);
    this.currentLogFile = this.rotator.getRotatedFilePath('app-tskv');
  }

  private formatMessage(
    level: string,
    message: LogMessage,
    context?: LogContext,
    stack?: string,
  ): string {
    const logEntry: TSKVLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || 'Unknown',
    };

    if (typeof message === 'string') {
      logEntry.message = message;
    } else if (Array.isArray(message)) {
      logEntry.message = JSON.stringify(message);
    } else if (message instanceof Error) {
      logEntry.message = message.message;
      logEntry.stack = this.cleanStackTrace(message.stack || '');
    } else if (typeof message === 'object' && message !== null) {
      Object.entries(message).forEach(([key, value]) => {
        logEntry[key] = this.stringifyValue(value);
      });
    } else {
      logEntry.message = String(message);
    }

    if (stack && level === 'error' && !logEntry.stack) {
      logEntry.stack = this.cleanStackTrace(stack);
    }

    return this.toTSKV(logEntry);
  }

  private stringifyValue(value: LogMessage): string {
    if (value === null || value === undefined) return 'null';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      const inspected = util.inspect(value, { depth: 1 });
      return inspected.length > 500
        ? inspected.substring(0, 500) + '...'
        : inspected;
    }
    const stringValue = String(value);
    return stringValue.length > 500
      ? stringValue.substring(0, 500) + '...'
      : stringValue;
  }

  private cleanStackTrace(stack: string): string {
    return stack.split('\n').slice(0, 3).join('\n').trim();
  }

  private toTSKV(obj: TSKVLogEntry): string {
    return Object.entries(obj)
      .filter(([, value]) => value != null)
      .map(([key, value]) => `${key}=${value}`)
      .join('\t');
  }

  private writeToFile(message: string): void {
    this.currentLogFile = this.rotator.rotateIfNeeded(
      this.currentLogFile,
      'app-tskv',
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
