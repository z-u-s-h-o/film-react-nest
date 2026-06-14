import * as fs from 'node:fs';
import * as path from 'node:path';

export class LogRotator {
  private logDir: string;
  private maxFileSize: number;

  constructor(logDir: string, maxFileSize = 10 * 1024 * 1024) {
    this.logDir = logDir;
    this.maxFileSize = maxFileSize;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  getRotatedFilePath(baseName: string): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${baseName}-${date}.log`);
  }

  shouldRotate(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      return stats.size >= this.maxFileSize;
    } catch (error) {
      return true;
    }
  }

  rotateIfNeeded(currentPath: string, baseName: string): string {
    if (this.shouldRotate(currentPath)) {
      return this.getRotatedFilePath(baseName);
    }
    return currentPath;
  }
}
