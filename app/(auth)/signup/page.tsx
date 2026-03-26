import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up | Saumya's Table",
  description: "Create your Saumya's Table account to order weekly home-cooked Sri Lankan meals.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Join Saumya&apos;s Table for weekly home-cooked meals
          </p>
        </div>

        <SignUpForm />

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
