import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Saumya's Table",
  description: "Reset your Saumya's Table account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
