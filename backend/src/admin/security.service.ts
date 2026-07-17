import { Injectable, Logger } from '@nestjs/common';
import * as util from 'util';
import * as childProcess from 'child_process';
import * as fs from 'fs';

const execAsync = util.promisify(childProcess.exec);

export interface UfwRule {
  to: string;
  action: string;
  from: string;
}

export interface UfwStatus {
  enabled: boolean;
  rules: UfwRule[];
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  // ==========================
  // UFW (Firewall) Methods
  // ==========================
  async getUfwStatus(): Promise<UfwStatus> {
    try {
      const { stdout } = await execAsync('ufw status');
      const lines = stdout.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      const isEnabled = lines[0]?.toLowerCase().includes('active');
      
      if (!isEnabled) {
        return { enabled: false, rules: [] };
      }

      // Parse rules
      const rules: UfwRule[] = [];
      let inRulesSection = false;
      
      for (const line of lines) {
        if (line.includes('To') && line.includes('Action') && line.includes('From')) {
          inRulesSection = true;
          continue;
        }
        if (line.startsWith('--')) continue;
        
        if (inRulesSection) {
          // Format: 22/tcp ALLOW Anywhere
          const parts = line.split(/\s{2,}/); // Split by 2 or more spaces
          if (parts.length >= 3) {
            rules.push({
              to: parts[0],
              action: parts[1],
              from: parts[2]
            });
          }
        }
      }

      return { enabled: true, rules };
    } catch (e: any) {
      this.logger.error('Failed to get UFW status', e);
      return { enabled: false, rules: [] };
    }
  }

  async toggleUfw(enable: boolean) {
    try {
      if (enable) {
        // SAFETY FIRST: Always allow SSH before enabling UFW to prevent lockout
        const sshConfig = await this.getSshConfig();
        await execAsync(`ufw allow ${sshConfig.port}`);
        await execAsync('echo "y" | ufw enable');
      } else {
        await execAsync('ufw disable');
      }
      return { success: true };
    } catch (e: any) {
      throw new Error(`Failed to toggle UFW: ${e.message}`);
    }
  }

  async addUfwRule(port: string, protocol: string = 'tcp') {
    try {
      await execAsync(`ufw allow ${port}/${protocol}`);
      return { success: true };
    } catch (e: any) {
      throw new Error(`Failed to add UFW rule: ${e.message}`);
    }
  }

  async deleteUfwRule(port: string, protocol: string = 'tcp') {
    try {
      // Safety check to prevent deleting SSH
      const sshConfig = await this.getSshConfig();
      if (port === sshConfig.port.toString() || port === `${sshConfig.port}/tcp`) {
        throw new Error('Penghapusan port SSH diblokir demi keamanan (Safety First) agar Anda tidak terkunci.');
      }
      await execAsync(`ufw delete allow ${port}/${protocol}`);
      return { success: true };
    } catch (e: any) {
      throw new Error(`Failed to delete UFW rule: ${e.message}`);
    }
  }

  // ==========================
  // Fail2Ban Methods
  // ==========================
  async getFail2BanStatus() {
    try {
      // Check if installed
      await execAsync('which fail2ban-client');
      
      // Get config if exists
      const configPath = '/etc/fail2ban/jail.local';
      let maxretry = 5;
      let bantime = 600; // 10 minutes in seconds
      let enabled = false;

      if (fs.existsSync(configPath)) {
        enabled = true;
        const content = fs.readFileSync(configPath, 'utf8');
        const retryMatch = content.match(/maxretry\s*=\s*(\d+)/);
        const banMatch = content.match(/bantime\s*=\s*(\d+[smhd]?)/);
        
        if (retryMatch) maxretry = parseInt(retryMatch[1], 10);
        if (banMatch) {
          const val = banMatch[1];
          if (val.endsWith('m')) bantime = parseInt(val) * 60;
          else if (val.endsWith('h')) bantime = parseInt(val) * 3600;
          else bantime = parseInt(val);
        }
      }

      return {
        installed: true,
        enabled,
        maxretry,
        bantime: Math.floor(bantime / 60) // return in minutes
      };
    } catch (e) {
      // Not installed or error
      return { installed: false, enabled: false, maxretry: 5, bantime: 10 };
    }
  }

  async configureFail2Ban(enable: boolean, maxretry: number, bantimeMins: number) {
    try {
      if (enable) {
        // Install if not present
        try {
          await execAsync('which fail2ban-client');
        } catch {
          this.logger.log('Installing fail2ban...');
          await execAsync('apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y fail2ban');
        }

        const configPath = '/etc/fail2ban/jail.local';
        const configContent = `[DEFAULT]
bantime = ${bantimeMins}m
findtime = 10m
maxretry = ${maxretry}

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = ${maxretry}
`;
        fs.writeFileSync(configPath, configContent);
        await execAsync('systemctl restart fail2ban');
        return { success: true, message: 'Fail2Ban enabled and configured.' };
      } else {
        const configPath = '/etc/fail2ban/jail.local';
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath);
        }
        await execAsync('systemctl restart fail2ban');
        return { success: true, message: 'Fail2Ban disabled.' };
      }
    } catch (e: any) {
      throw new Error(`Failed to configure Fail2Ban: ${e.message}`);
    }
  }

  // ==========================
  // SSH Config Methods
  // ==========================
  async getSshConfig() {
    try {
      const configPath = '/etc/ssh/sshd_config';
      let port = 22;
      let rootLogin = 'prohibit-password';

      if (fs.existsSync(configPath)) {
        const lines = fs.readFileSync(configPath, 'utf8').split('\n');
        for (const line of lines) {
          const t = line.trim();
          if (t.startsWith('#')) continue;
          
          if (t.startsWith('Port ')) {
            port = parseInt(t.split(/\s+/)[1], 10);
          } else if (t.startsWith('PermitRootLogin ')) {
            rootLogin = t.split(/\s+/)[1];
          }
        }
      }
      return {
        port,
        permitRootLogin: rootLogin === 'yes'
      };
    } catch (e) {
      this.logger.error('Failed to read SSH config', e);
      return { port: 22, permitRootLogin: false };
    }
  }

  async updateSshConfig(newPort: number, permitRootLogin: boolean) {
    try {
      if (newPort < 1 || newPort > 65535) {
        throw new Error('Port tidak valid (harus di antara 1 - 65535).');
      }

      const configPath = '/etc/ssh/sshd_config';
      if (!fs.existsSync(configPath)) {
        throw new Error('File konfigurasi SSH (/etc/ssh/sshd_config) tidak ditemukan.');
      }

      let content = fs.readFileSync(configPath, 'utf8');
      
      // Update Port
      if (content.match(/^Port\s+\d+/m)) {
        content = content.replace(/^Port\s+\d+/m, `Port ${newPort}`);
      } else if (content.match(/^#Port\s+\d+/m)) {
        content = content.replace(/^#Port\s+\d+/m, `Port ${newPort}`);
      } else {
        content = `Port ${newPort}\n` + content;
      }

      // Update PermitRootLogin
      const rootStr = permitRootLogin ? 'yes' : 'no';
      if (content.match(/^PermitRootLogin\s+\S+/m)) {
        content = content.replace(/^PermitRootLogin\s+\S+/m, `PermitRootLogin ${rootStr}`);
      } else if (content.match(/^#PermitRootLogin\s+\S+/m)) {
        content = content.replace(/^#PermitRootLogin\s+\S+/m, `PermitRootLogin ${rootStr}`);
      } else {
        content = `PermitRootLogin ${rootStr}\n` + content;
      }

      fs.writeFileSync(configPath, content);
      
      // SAFETY FIRST: If UFW is enabled, allow the new port BEFORE restarting SSH
      const ufw = await this.getUfwStatus();
      if (ufw.enabled) {
        await execAsync(`ufw allow ${newPort}/tcp`);
      }

      // Restart SSH
      await execAsync('systemctl restart sshd || service ssh restart');

      return { success: true };
    } catch (e: any) {
      throw new Error(`Failed to update SSH config: ${e.message}`);
    }
  }
}
