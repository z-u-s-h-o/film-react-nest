import { JsonLogger } from './json-logger.service';
import * as fs from 'node:fs';
import { LogMessage } from './logger.types';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let writeFileSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    writeFileSyncSpy = jest
      .spyOn(fs, 'appendFileSync')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    writeFileSyncSpy.mockRestore();
  });

  describe('formatMessage', () => {
    it('should format simple string message as JSON', () => {
      const result = logger['formatMessage'](
        'info',
        'test message',
        'TestContext',
      );
      const parsed = JSON.parse(result);

      expect(parsed.level).toBe('info');
      expect(parsed.context).toBe('TestContext');
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.message).toBe('test message');
    });

    it('should handle Error object correctly', () => {
      const error = new Error('Database error');
      error.stack = 'Error: Database error\n    at func1\n    at func2';

      const result = logger['formatMessage'](
        'error',
        error,
        'DB',
        'custom stack trace',
      );
      const parsed = JSON.parse(result);

      expect(parsed.message.message).toBe('Database error');
      expect(parsed.stack).toBe('custom stack trace');
    });

    it('should use Error.stack when no custom stack provided', () => {
      const error = new Error('Network error');
      error.stack = 'NetworkError: failed to connect\n    at fetchData';

      const result = logger['formatMessage']('error', error, 'API');
      const parsed = JSON.parse(result);

      expect(parsed.message.message).toBe('Network error');
      expect(parsed.stack).toBe(
        'NetworkError: failed to connect\n    at fetchData',
      );
    });

    it('should handle Date object correctly', () => {
      const date = new Date('2023-01-01T10:00:00Z');
      const result = logger['formatMessage']('debug', date, 'TimeTest');
      const parsed = JSON.parse(result);

      expect(new Date(parsed.message)).toEqual(date);
    });

    it('should preserve nested objects structure', () => {
      const complexObj: LogMessage = {
        user: { id: 1, name: 'Alice' },
        metadata: [1, 2, 3],
        active: true,
      };
      const result = logger['formatMessage']('verbose', complexObj, 'Complex');
      const parsed = JSON.parse(result);

      expect(parsed.message).toEqual(complexObj);
    });

    it('should handle object message correctly', () => {
      const testObj = { user: 'john', action: 'login' };
      const result = logger['formatMessage']('debug', testObj, 'Auth');
      const parsed = JSON.parse(result);

      expect(parsed.message).toEqual(testObj);
    });

    it('should include stack trace for errors', () => {
      const stack = 'Error: something went wrong\n    at function';
      const result = logger['formatMessage'](
        'error',
        'error message',
        'App',
        stack,
      );
      const parsed = JSON.parse(result);

      expect(parsed.stack).toBe(stack);
    });
  });

  describe('writeToFile', () => {
    it('should write formatted message to file', () => {
      logger['writeToFile']('{"test": "data"}');
      expect(writeFileSyncSpy).toHaveBeenCalledWith(
        expect.any(String),
        '{"test": "data"}\n',
        'utf8',
      );
    });

    it('should fallback to console.log on write error', () => {
      writeFileSyncSpy.mockImplementationOnce(() => {
        throw new Error('Write failed');
      });
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      logger['writeToFile']('{"test": "data"}');

      expect(consoleLogSpy).toHaveBeenCalledWith('{"test": "data"}');
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });
});
