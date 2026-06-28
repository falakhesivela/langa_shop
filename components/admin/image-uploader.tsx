"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadFileToR2 } from "@/lib/api/admin";
import type { ProductImageInput } from "@/lib/types/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";

type ImageUploaderProps = {
  images: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
  altFallback?: string;
};

export function ImageUploader({
  images,
  onChange,
  altFallback = "",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploaded: ProductImageInput[] = [];

      for (const file of Array.from(fileList)) {
        const publicUrl = await uploadFileToR2(file);
        uploaded.push({
          url: publicUrl,
          alt_text: altFallback || file.name,
          sort_order: images.length + uploaded.length,
          is_primary: images.length === 0 && uploaded.length === 0,
        });
      }

      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(getErrorMessage(err, "Image upload failed."));
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function setPrimary(index: number) {
    onChange(
      images.map((image, imageIndex) => ({
        ...image,
        is_primary: imageIndex === index,
      })),
    );
  }

  function removeImage(index: number) {
    const next = images.filter((_, imageIndex) => imageIndex !== index);
    if (next.length > 0 && !next.some((image) => image.is_primary)) {
      next[0] = { ...next[0], is_primary: true };
    }
    onChange(next.map((image, imageIndex) => ({ ...image, sort_order: imageIndex })));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Images
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload to Cloudflare R2. First image is primary unless you choose another.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          isLoading={isUploading}
        >
          Upload image
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {error ? <p className="text-sm text-accent">{error}</p> : null}

      {images.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="rounded-sm border border-border p-3"
            >
              <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                <Image
                  src={image.url}
                  alt={image.alt_text ?? "Product image"}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className={`text-xs uppercase tracking-wide ${
                    image.is_primary ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {image.is_primary ? "Primary" : "Set primary"}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
      )}
    </div>
  );
}
