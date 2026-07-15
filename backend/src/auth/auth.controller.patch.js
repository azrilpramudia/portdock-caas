const fs = require('fs');

let content = fs.readFileSync('backend/src/auth/auth.controller.ts', 'utf8');

const newEndpoints = `
  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async setup2fa(@Request() req: any) {
    return this.authService.setup2fa(req.user.userId || req.user.sub);
  }

  @Post('2fa/verify')
  async verify2fa(@Body() body: { token: string; setupToken: string; isSetup: boolean }, @Request() req: any) {
    // We need to decode the setupToken (or tempToken) to get the user ID.
    let payload;
    try {
      payload = this.authService['jwtService'].verify(body.setupToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired 2FA session');
    }
    
    return this.authService.verify2fa(payload.sub, body.token, body.isSetup, req.ip || req.connection.remoteAddress);
  }
`;

if (!content.includes("@Post('2fa/setup')")) {
  content = content.replace(/}\s*$/, newEndpoints + '\n}');
  // Also add UnauthorizedException to imports if not there
  if (!content.includes("UnauthorizedException")) {
    content = content.replace("import {", "import { UnauthorizedException,");
  }
}

fs.writeFileSync('backend/src/auth/auth.controller.ts', content);
