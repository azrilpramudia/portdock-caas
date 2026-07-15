const fs = require('fs');

let content = fs.readFileSync('backend/src/auth/auth.service.ts', 'utf8');

// Add imports
if (!content.includes("import * as otplib from 'otplib';")) {
  content = content.replace("import * as crypto from 'crypto';", "import * as crypto from 'crypto';\nimport * as otplib from 'otplib';\nimport * as qrcode from 'qrcode';");
}

const loginRegex = /async login\(dto: LoginDto, ip: string\) \{([\s\S]*?)const token = this.generateToken\(user\);\s*return \{ user: userWithoutPassword, token \};\s*\}/;

const newLoginLogic = `async login(dto: LoginDto, ip: string) {
    await this.verifyTurnstileToken(dto.turnstileToken);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Please contact administrator.');
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - new Date().getTime()) / 60000);
      throw new UnauthorizedException(\`Account locked due to too many failed attempts. Try again in \${minutesLeft} minutes.\`);
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      let failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'loginAttempts' } });
      const maxAttempts = setting?.value ? parseInt(setting.value, 10) : 5;

      let lockoutUntil = null;
      if (failedAttempts >= maxAttempts) {
        lockoutUntil = new Date(new Date().getTime() + 15 * 60000); // 15 mins
        failedAttempts = 0;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: failedAttempts, lockoutUntil },
      });

      if (lockoutUntil) {
        throw new UnauthorizedException(\`Account locked due to too many failed attempts. Try again in 15 minutes.\`);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    const twoFactorSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'twoFactor' } });
    const isGlobalTwoFactorEnabled = twoFactorSetting?.value === 'true';

    // If 2FA is globally enabled and user is an admin
    if (isGlobalTwoFactorEnabled && user.role === 'ADMIN') {
      const tempToken = this.jwtService.sign({ sub: user.id, requires2fa: true }, { expiresIn: '5m' });
      
      if (!user.isTwoFactorEnabled) {
        return { requires2faSetup: true, tempToken };
      } else {
        return { requires2fa: true, tempToken };
      }
    }

    await this.prisma.$transaction([
      this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          description: 'User logged in',
          ipAddress: ip,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), failedLoginAttempts: 0, lockoutUntil: null },
      }),
    ]);

    const { password: _, ...userWithoutPassword } = user;
    const token = await this.generateToken(user);
    return { user: userWithoutPassword, token };
  }`;

content = content.replace(loginRegex, newLoginLogic);

// Add 2FA setup and verify methods
const newMethods = `
  async setup2fa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    
    const secret = otplib.authenticator.generateSecret();
    const otpauthUrl = otplib.authenticator.keyuri(user.email, 'Portdock', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    });
    
    return { qrCode: qrCodeDataUrl, secret };
  }

  async verify2fa(userId: string, token: string, isSetup: boolean, ip: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new UnauthorizedException('2FA not configured');
    
    const isValid = otplib.authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) throw new UnauthorizedException('Invalid 2FA token');
    
    if (isSetup) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isTwoFactorEnabled: true }
      });
    }

    await this.prisma.$transaction([
      this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          description: 'User logged in with 2FA',
          ipAddress: ip,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), failedLoginAttempts: 0, lockoutUntil: null },
      }),
    ]);
    
    const { password: _, ...userWithoutPassword } = user;
    const jwtToken = await this.generateToken(user);
    return { user: userWithoutPassword, token: jwtToken };
  }
`;

// Insert before the last bracket
content = content.replace(/}\s*$/, newMethods + '\n}');

// Modify generateToken to be async and read sessionTimeout
const generateTokenRegex = /generateToken\(user: any\) \{([\s\S]*?)\}/;
const newGenerateToken = `async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    let expiresIn = '7d';
    try {
      const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'sessionTimeout' } });
      if (setting && setting.value) {
        expiresIn = setting.value + 'm'; // e.g. '30m'
      }
    } catch (e) {
      console.error('Failed to read sessionTimeout', e);
    }
    
    return this.jwtService.sign(payload, { expiresIn });
  }`;
content = content.replace(generateTokenRegex, newGenerateToken);

// Update places that call generateToken
content = content.replace(/const token = this\.generateToken\(user\);/g, "const token = await this.generateToken(user);");

fs.writeFileSync('backend/src/auth/auth.service.ts', content);
