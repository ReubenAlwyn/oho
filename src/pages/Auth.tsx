import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import shawarmaPixel from "../assets/shawarma-pixel.png";
import { Suspense, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track auth state on mount — only clear guest flag if auth CHANGES during this session
  const wasAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Only clear guest flag if user was NOT authenticated when this page loaded
      // (i.e. they just signed in, not just visiting while already logged in)
      if (!wasAuthenticatedRef.current) {
        localStorage.removeItem("force-guest-ts");
      }
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again in a sec."
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError("Guest login failed. Give it another shot.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col relative scanlines">
      <div className="absolute inset-0 grid-bg" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <img src={shawarmaPixel} alt="" className="w-12" style={{ imageRendering: "pixelated", height: "auto" }} />
          <span className="neon-cyan" style={{ fontSize: "20px" }}>
            OHO
          </span>
        </button>
      </header>

      {/* Auth Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-[400px] bg-[#0e0e1a] border-[#2a2a40] shadow-[0_0_40px_rgba(200,80,255,0.08)]">
          {step === "signIn" ? (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-14 h-14 rounded-xl bg-[#c850ff]/10 border border-[#c850ff]/20 flex items-center justify-center shadow-[0_0_15px_rgba(200,80,255,0.15)]">
                    <img src={shawarmaPixel} alt="" className="w-8" style={{ imageRendering: "pixelated", height: "auto" }} />
                  </div>
                </div>
                <CardTitle className="text-xl text-[#e0e0f0]">Enter the Maze</CardTitle>
                <CardDescription className="text-[#6a6a8a]">
                  Drop your email to get in — takes two seconds
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6a6a8a]" />
                      <Input
                        name="email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-9 bg-[#1a1a2e] border-[#2a2a40] text-[#e0e0f0] placeholder:text-[#3a3a52] focus:border-[#c850ff]/50 focus:shadow-[0_0_10px_rgba(200,80,255,0.15)]"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                      className="border-[#2a2a40] bg-[#1a1a2e] hover:bg-[#c850ff]/10 hover:border-[#c850ff]/40 text-[#e0e0f0]"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-[#ff3366]">{error}</p>
                  )}
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#2a2a40]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0e0e1a] px-2 text-[#6a6a8a]">Or</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4 bg-[#1a1a2e] border-[#2a2a40] text-[#c0c0d8] hover:bg-[#1a1a2e]/80 hover:border-[#3a3a52]"
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Jump in as Guest
                    </Button>
                  </div>
                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center mt-2">
                <CardTitle className="text-[#e0e0f0]">Check your email</CardTitle>
                <CardDescription className="text-[#6a6a8a]">
                  We sent a code to <span className="font-medium text-[#e0e0f0]">{step.email}</span>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} className="bg-[#1a1a2e] border-[#2a2a40] text-[#e0e0f0]" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-[#ff3366] text-center">{error}</p>
                  )}
                  <p className="text-sm text-[#6a6a8a] text-center mt-4">
                    Didn&apos;t receive a code?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[#c850ff] hover:text-[#c850ff]/80"
                      onClick={() => setStep("signIn")}
                    >
                      Try a different email
                    </Button>
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#c850ff] hover:bg-[#c850ff]/90 text-[#06060e] border-none shadow-[0_0_15px_rgba(200,80,255,0.2)]"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
