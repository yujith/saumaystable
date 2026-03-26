"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SlipUpload({ orderId }: { orderId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(selected.type)) {
      setError("Please upload a JPEG, PNG, WebP, or HEIC image.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }

    setError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/orders/${orderId}/slip`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed. Please try again.");
        setIsUploading(false);
        return;
      }

      setUploaded(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  if (uploaded) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2 mt-3">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        <p className="text-xs text-green-800">
          Payment slip uploaded. We&apos;ll verify it shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {!file ? (
        <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 cursor-pointer hover:bg-amber-50 transition-colors">
          <Upload className="h-5 w-5 text-amber-600 mb-1" />
          <span className="text-xs font-medium text-amber-800">
            Upload payment slip
          </span>
          <span className="text-[10px] text-amber-600 mt-0.5">
            JPEG, PNG, WebP, or HEIC · Max 5MB
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="space-y-2">
          <div className="relative rounded-lg border overflow-hidden">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Payment slip preview"
                className="w-full max-h-48 object-contain bg-white"
              />
            )}
            <button
              onClick={clearFile}
              className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {file.name}
          </p>
          <Button
            size="sm"
            className="w-full"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Slip"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
