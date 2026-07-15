const fs = require('fs');

let content = fs.readFileSync('backend/src/auth/auth.controller.ts', 'utf8');
content = content.replace(/import \{ UnauthorizedException,\s*/g, 'import { ');
// Then just add it properly to the first import from '@nestjs/common'
content = content.replace(/import \{\s*Controller,/, "import { Controller, UnauthorizedException,");
fs.writeFileSync('backend/src/auth/auth.controller.ts', content);

let authService = fs.readFileSync('backend/src/auth/auth.service.ts', 'utf8');
authService = authService.replace(/import \{ authenticator \} from 'otplib';/g, "import * as otplib from 'otplib';");
authService = authService.replace(/authenticator\.generateSecret/g, "otplib.authenticator.generateSecret");
authService = authService.replace(/authenticator\.keyuri/g, "otplib.authenticator.keyuri");
authService = authService.replace(/authenticator\.verify/g, "otplib.authenticator.verify");
fs.writeFileSync('backend/src/auth/auth.service.ts', authService);
