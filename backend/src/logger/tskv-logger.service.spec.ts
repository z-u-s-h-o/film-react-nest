import { TSKVLogger } from './tskv-logger.service';
import * as fs from 'node:fs';
import * as util from 'node:util';

describe('TSKVLogger', () => {
  let logger: TSKVLogger;
  let writeFileSyncSpy: jest.SpyInstance;
  let utilInspectSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TSKVLogger();
    writeFileSyncSpy = jest
      .spyOn(fs, 'appendFileSync')
      .mockImplementation(() => {});
    utilInspectSpy = jest.spyOn(util, 'inspect').mockReturnValue('{...}');
  });

  afterEach(() => {
    writeFileSyncSpy.mockRestore();
    utilInspectSpy.mockRestore();
  });

  describe('formatMessage', () => {
    it('should format message in TSKV format', () => {
      const result = logger['formatMessage'](
        'warn',
        'warning message',
        'Security',
      );

      expect(result).toContain('level=warn');
      expect(result).toContain('context=Security');
      expect(result).toContain('message=warning message');
      expect(result).toMatch(
        /timestamp=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
      );
    });

    it('should handle Error object with stack', () => {
      const error = new Error('Critical error');
      error.stack = 'Error: Critical error\n    at func1\n    at func2';
      const result = logger['formatMessage']('error', error, 'System');

      expect(result).toContain('message=Critical error');
      expect(result).toContain('stack=Error: Critical error');
      expect(result).toContain('at func1');
    });

    it('should properly stringify Date objects', () => {
      const date = new Date('2023-01-01T10:00:00Z');
      const result = logger['stringifyValue'](date);
      expect(result).toBe('2023-01-01T10:00:00.000Z');
    });

    it('should handle null and undefined values', () => {
      expect(logger['stringifyValue'](null)).toBe('null');
      expect(logger['stringifyValue'](undefined)).toBe('null');
    });

    it('should flatten object properties into TSKV', () => {
      const obj = { user: 'alice', role: 'admin' };
      const result = logger['formatMessage']('info', obj, 'Auth');

      expect(result).toContain('user=alice');
      expect(result).toContain('role=admin');
      expect(result).toContain('level=info');
      expect(result).toContain('context=Auth');
    });

    it('should truncate long values in stringifyValue', () => {
      const longString = 'a'.repeat(600);
      const result = logger['stringifyValue'](longString);
      expect(result.length).toBeLessThanOrEqual(503);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should clean stack trace to first 3 lines', () => {
      const longStack =
        'Error: test\n    at func1\n    at func2\n    at func3\n    at func4';
      const cleaned = logger['cleanStackTrace'](longStack);
      const lines = cleaned.split('\n');

      expect(lines.length).toBe(3);
      expect(lines[0]).toBe('Error: test');
      expect(lines[1]).toBe('    at func1');
      expect(lines[2]).toBe('    at func2');
    });
  });

  describe('toTSKV', () => {
    it('should convert object to TSKV format with tabs', () => {
      const input = { a: '1', b: '2', c: null };
      const result = logger['toTSKV'](input);
      const pairs = result.split('\t');

      expect(pairs).toHaveLength(2);
      expect(pairs).toContain('a=1');
      expect(pairs).toContain('b=2');
    });
  });

  describe('writeToFile', () => {
    it('should write TSKV message to file with newline', () => {
      logger['writeToFile']('test=value');
      expect(writeFileSyncSpy).toHaveBeenCalledWith(
        expect.stringContaining('app-tskv'),
        'test=value\n',
        'utf8',
      );
    });
  });
});
