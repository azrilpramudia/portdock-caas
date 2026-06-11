import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);

  cloneRepository(repositoryUrl: string, branch: string, cloneDir: string): void {
    this.logger.log(`Cloning repository ${repositoryUrl} (branch: ${branch}) into ${cloneDir}`);
    execSync(`git clone --depth 1 --branch ${branch} ${repositoryUrl} ${cloneDir}`, {
      timeout: 120000,
      stdio: 'pipe',
    });
  }
}
