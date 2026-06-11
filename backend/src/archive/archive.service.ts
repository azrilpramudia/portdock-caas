import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import extractZip from 'extract-zip';

@Injectable()
export class ArchiveService {
  private readonly logger = new Logger(ArchiveService.name);

  async extractAndFlatten(filePath: string, extractDir: string): Promise<void> {
    this.logger.log(`Extracting ZIP from ${filePath} to ${extractDir}`);
    await extractZip(filePath, { dir: extractDir });
    this.flattenDirectory(extractDir);
  }

  private flattenDirectory(dir: string) {
    const items = fs.readdirSync(dir);
    if (items.length === 1) {
      const singleItemPath = path.join(dir, items[0]);
      if (fs.statSync(singleItemPath).isDirectory()) {
        this.logger.log(`Flattening root folder: ${items[0]}`);
        const innerItems = fs.readdirSync(singleItemPath);
        for (const item of innerItems) {
          fs.renameSync(path.join(singleItemPath, item), path.join(dir, item));
        }
        fs.rmSync(singleItemPath, { recursive: true, force: true });
      }
    }
  }

  cleanup(extractDir: string, filePath?: string) {
    try {
      if (extractDir && fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      this.logger.warn(`Cleanup failed: ${err.message}`);
    }
  }
}
