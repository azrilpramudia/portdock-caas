import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);

  cloneRepository(
    repositoryUrl: string,
    branch: string,
    cloneDir: string,
    credentials?: {
      sshPrivateKey?: string | null;
      githubToken?: string | null;
    },
  ): void {
    this.logger.log(
      `Cloning repository ${repositoryUrl} (branch: ${branch}) into ${cloneDir}`,
    );

    let finalUrl = repositoryUrl;
    const env: Record<string, string | undefined> = {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
    };
    let tempKeyPath: string | null = null;

    if (credentials?.sshPrivateKey && repositoryUrl.startsWith('git@')) {
      tempKeyPath = path.join('/tmp', `id_ed25519_${Date.now()}`);
      fs.writeFileSync(tempKeyPath, credentials.sshPrivateKey, { mode: 0o600 });
      env.GIT_SSH_COMMAND = `ssh -i ${tempKeyPath} -o StrictHostKeyChecking=no`;
    } else if (
      credentials?.githubToken &&
      repositoryUrl.startsWith('https://')
    ) {
      const urlObj = new URL(repositoryUrl);
      urlObj.username = credentials.githubToken;
      finalUrl = urlObj.toString();
    }

    try {
      execSync(
        `git clone --depth 1 --branch ${branch} ${finalUrl} ${cloneDir}`,
        {
          timeout: 120000,
          stdio: 'pipe',
          env,
        },
      );
    } finally {
      if (tempKeyPath && fs.existsSync(tempKeyPath)) {
        fs.unlinkSync(tempKeyPath);
      }
    }
  }
}
