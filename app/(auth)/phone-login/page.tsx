import type { Metadata } from "next";
import Link from "next/link";
import { PhoneOtpForm } from "./phone-otp-form";

export const metadata: Metadata = {
  title: "Phone Login | Saumya's Table",
  description: "Log in with your phone number via OTP.",
};

export default function PhoneLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Log in with Phone</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll send a 6-digit code to your phone
          </p>
        </div>

        <PhoneOtpForm />

        <div className="text-center space-y-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            Log in with email instead
          </Link>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
