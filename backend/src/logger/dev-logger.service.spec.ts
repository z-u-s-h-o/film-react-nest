import { Test } from '@nestjs/testing';
import { DevLogger } from './dev-logger.service';
import { LogMessage } from './logger.types';

describe('DevLogger', () => {
  let logger: DevLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DevLogger],
    }).compile();
    logger = module.get<DevLogger>(DevLogger);

    logSpy = jest.spyOn(logger, 'log');
    errorSpy = jest.spyOn(logger, 'error');
    warnSpy = jest.spyOn(logger, 'warn');
    debugSpy = jest.spyOn(logger, 'debug');
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    debugSpy.mockRestore();
  });

  describe('log methods', () => {
    it('should call log with string message and context', () => {
      logger.log('test message', 'TestContext');
      expect(logSpy).toHaveBeenCalledWith('test message', 'TestContext');
    });

    it('should handle Error object as message', () => {
      const error = new Error('Test error');
      logger.error(error, 'TestContext');
      expect(errorSpy).toHaveBeenCalledWith(error, 'TestContext');
    });

    it('should handle Date object as message', () => {
      const date = new Date();
      logger.log(date, 'TestContext');
      expect(logSpy).toHaveBeenCalledWith(date, 'TestContext');
    });

    it('should handle nested object as message', () => {
      const nestedObj: LogMessage = {
        user: { id: 1, name: 'John' },
        action: 'login',
      };
      logger.warn(nestedObj, 'Auth');
      expect(warnSpy).toHaveBeenCalledWith(nestedObj, 'Auth');
    });

    it('should handle array as message', () => {
      const arr = ['test', 123, true];
      logger.debug(arr, 'ArrayTest');
      expect(debugSpy).toHaveBeenCalledWith(arr, 'ArrayTest');
    });
  });
});
