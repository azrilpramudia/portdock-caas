const fs = require('fs');
let content = fs.readFileSync('backend/src/auth/auth.service.ts', 'utf8');

content = content.replace(/import \* as otplib from 'otplib';/g, "import * as speakeasy from 'speakeasy';");
content = content.replace(/const secret = otplib\.authenticator\.generateSecret\(\);/g, "const secretResult = speakeasy.generateSecret({ name: 'Portdock (' + user.email + ')' });\n    const secret = secretResult.base32;");
content = content.replace(/const otpauthUrl = otplib\.authenticator\.keyuri\(user\.email, 'Portdock', secret\);/g, "const otpauthUrl = secretResult.otpauth_url || '';");
content = content.replace(/const isValid = otplib\.authenticator\.verify\(\{ token, secret: user\.twoFactorSecret \}\);/g, "const isValid = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token });");

fs.writeFileSync('backend/src/auth/auth.service.ts', content);

let frontendAppCard = fs.readFileSync('frontend/src/components/admin/settings/AppearanceSettingsCard.tsx', 'utf8');
frontendAppCard = frontendAppCard.replace(/onValueChange=\{setSidebarStyle\}/g, 'onValueChange={(val) => setSidebarStyle(val || "")}');
fs.writeFileSync('frontend/src/components/admin/settings/AppearanceSettingsCard.tsx', frontendAppCard);

