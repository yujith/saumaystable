"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { phoneOtpSchema, verifyOtpSchema, type PhoneOtpFormData, type VerifyOtpFormData } from "@/types/auth";
import { sendPhoneOtp, verifyPhoneOtp } from "../actions";

export function PhoneOtpForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const phoneForm = useForm<PhoneOtpFormData>({
    resolver: zodResolver(phoneOtpSchema),
    defaultValues: {
      phone: "+94",
    },
  });

  const otpForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  async function onSendOtp(data: PhoneOtpFormData) {
    setServerMessage(null);
    const result = await sendPhoneOtp(data.phone);

    if (result.error) {
      setServerMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setPhoneNumber(data.phone);
      otpForm.setValue("phone", data.phone);
      setStep("otp");
      setServerMessage({ type: "success", text: result.success });
    }
  }

  async function onVerifyOtp(data: VerifyOtpFormData) {
    setServerMessage(null);
    const result = await verifyPhoneOtp(data.phone, data.token);

    if (result?.error) {
      setServerMessage({ type: "error", text: result.error });
    }
  }

  if (step === "otp") {
    return (
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
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

            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to <span className="font-medium text-foreground">{phoneNumber}</span>
            </p>

            <input type="hidden" {...otpForm.register("phone")} />

            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
                className="text-center text-lg tracking-widest"
                {...otpForm.register("token")}
              />
              {otpForm.formState.errors.token && (
                <p className="text-sm text-destructive">{otpForm.formState.errors.token.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Log In"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("phone");
                setServerMessage(null);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change phone number
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-4">
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
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+94771234567"
              autoComplete="tel"
              {...phoneForm.register("phone")}
            />
            <p className="text-xs text-muted-foreground">
              Sri Lankan number with country code (+94)
            </p>
            {phoneForm.formState.errors.phone && (
              <p className="text-sm text-destructive">{phoneForm.formState.errors.phone.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={phoneForm.formState.isSubmitting}>
            {phoneForm.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
