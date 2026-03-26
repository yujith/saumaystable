"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/types/auth";
import { forgotPassword } from "../actions";

export function ForgotPasswordForm() {
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setServerMessage(null);

    const formData = new FormData();
    formData.append("email", data.email);

    const result = await forgotPassword(formData);

    if (result.error) {
      setServerMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setServerMessage({ type: "success", text: result.success });
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverMessage && (
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                serverMessage.type === "error"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-green-50 text-green-800"
              }`}
            >
              {serverMessage.text}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
