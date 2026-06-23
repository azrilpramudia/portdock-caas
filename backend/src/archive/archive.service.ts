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
        // Hapus folder ekstrak (contoh: uploads/<projectId>/<timestamp>)
        fs.rmSync(extractDir, { recursive: true, force: true });

        // Cek parent folder (contoh: uploads/<projectId>)
        const parentDir = path.dirname(extractDir);
        if (fs.existsSync(parentDir)) {
          const items = fs.readdirSync(parentDir);
          // Jika parent folder sudah kosong (tidak ada folder timestamp lain), hapus parent-nya juga
          if (items.length === 0) {
            fs.rmSync(parentDir, { recursive: true, force: true });
            this.logger.log(`Cleaned up empty project folder: ${parentDir}`);
          }
        }
      }
      if (filePath && fs.existsSync(filePath)) {
        // Hapus file ZIP asli
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      this.logger.warn(`Cleanup failed: ${err.message}`);
    }
  }
}
