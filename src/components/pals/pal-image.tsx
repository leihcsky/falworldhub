"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type PalImageProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
};

const FALLBACK = "/images/pals/placeholder.svg";

export function PalImage({
  src,
  alt,
  size = 64,
  className,
  priority = false,
}: PalImageProps) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="object-contain"
        onError={() => {
          if (imageSrc !== FALLBACK) setImageSrc(FALLBACK);
        }}
      />
    </div>
  );
}
