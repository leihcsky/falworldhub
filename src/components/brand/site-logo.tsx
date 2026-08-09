import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  /** Show wordmark next to the mark (default true). */
  showWordmark?: boolean;
  /** Mark size in px */
  size?: number;
};

export function SiteLogo({
  className,
  showWordmark = true,
  size = 32,
}: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md outline-none",
        "transition-opacity hover:opacity-90",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label={SITE_NAME}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG mark */}
      <img
        src="/brand/logo-mark.svg"
        alt=""
        width={size}
        height={size}
        className="shrink-0"
        decoding="async"
      />
      {showWordmark ? (
        <span className="text-lg font-semibold tracking-tight">{SITE_NAME}</span>
      ) : null}
    </Link>
  );
}
