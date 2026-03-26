import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log In | Saumya's Table",
  description: "Log in to your Saumya's Table account.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; message?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to order your weekly meals
          </p>
        </div>

        {searchParams.message && (
          <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
            {searchParams.message}
          </div>
        )}

        <LoginForm redirectTo={searchParams.redirect} />

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Forgot password?
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/phone-login"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Use phone OTP
            </Link>
          </div>
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
