const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/forms/LoginForm.tsx', 'utf8');

if (!content.includes("requires2faSetup")) {
  const newImports = `
import Image from "next/image";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
`;
  content = content.replace('import Link from "next/link";', 'import Link from "next/link";\n' + newImports);

  const stateVariables = `
  const [twoFactorState, setTwoFactorState] = useState<'none' | 'setup' | 'verify'>('none');
  const [tempToken, setTempToken] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const queryClient = useQueryClient();
  const [isLoading2fa, setIsLoading2fa] = useState(false);
`;
  content = content.replace('const [showPassword, setShowPassword] = useState(false);', stateVariables + '\n  const [showPassword, setShowPassword] = useState(false);');

  const onSuccessLogic = `
        onSuccess: async (data: any) => {
          if (data.requires2faSetup) {
            setTempToken(data.tempToken);
            setTwoFactorState('setup');
            
            // Fetch setup QR code
            try {
              const res = await api.post('/auth/2fa/setup', {}, {
                headers: { Authorization: \`Bearer \${data.tempToken}\` }
              });
              setQrCodeUrl(res.data.qrCode);
            } catch (err: any) {
              toast.error(err?.response?.data?.message || 'Failed to initialize 2FA setup');
              setTwoFactorState('none');
            }
          } else if (data.requires2fa) {
            setTempToken(data.tempToken);
            setTwoFactorState('verify');
          } else {
            // Normal login success, handled by hook usually, but let's ensure we reset
            setTwoFactorState('none');
          }
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          if (msg && msg.includes('locked')) {
            toast.error(msg, { duration: 5000 });
          }
`;
  content = content.replace(/onError:\s*\(\)\s*=>\s*\{([\s\S]*?)\}/, onSuccessLogic + '$1}');

  const verify2faFunction = `
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading2fa(true);
    try {
      const res = await api.post('/auth/2fa/verify', {
        token: otpCode,
        setupToken: tempToken,
        isSetup: twoFactorState === 'setup'
      });
      
      // Manually store token and user since we bypass useLoginMutation's onSuccess partially if it returns early
      // The hook might need to be adjusted, or we just manually reload
      localStorage.setItem("auth-storage", JSON.stringify({ state: { user: res.data.user, token: res.data.token, isAuthenticated: true }, version: 0 }));
      toast.success("Login successful");
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP code");
    } finally {
      setIsLoading2fa(false);
    }
  };

  if (twoFactorState !== 'none') {
    return (
      <form onSubmit={handleVerify2FA} className="space-y-4 w-full text-center">
        <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
        {twoFactorState === 'setup' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Scan this QR code with Google Authenticator to setup 2FA.</p>
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} alt="2FA QR Code" width={150} height={150} />
            ) : (
              <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            )}
          </div>
        )}
        <div className="space-y-1.5 mt-4 text-left">
          <Label className="text-sm font-semibold">Enter 6-digit OTP</Label>
          <Input 
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-widest h-12"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading2fa || otpCode.length < 6}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg mt-2"
        >
          {isLoading2fa ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Verify & Login
        </Button>
        <Button type="button" variant="ghost" onClick={() => setTwoFactorState('none')} className="w-full mt-2">
          Cancel
        </Button>
      </form>
    );
  }
`;

  content = content.replace(/return\s*\(\s*<form/, verify2faFunction + '\n  return (\n    <form');
}

fs.writeFileSync('frontend/src/components/forms/LoginForm.tsx', content);
