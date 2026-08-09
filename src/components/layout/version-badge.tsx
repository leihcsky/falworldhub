import { useTranslations } from "next-intl";
import { formatDataUpdatedAt, getGameDataMeta } from "@/lib/game-version";
import { cn } from "@/lib/utils";

type VersionBadgeProps = {
  /** Compact for header; detailed for footer / page intros */
  variant?: "compact" | "detailed";
  className?: string;
};

export function VersionBadge({
  variant = "compact",
  className,
}: VersionBadgeProps) {
  const t = useTranslations("Version");
  const meta = getGameDataMeta();
  const updated = formatDataUpdatedAt(meta.dataUpdatedAt);

  if (variant === "detailed") {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {t("dataFor", { version: meta.gameVersionLabel })}
        <span className="mx-1.5 text-border">·</span>
        {t("updated", { date: updated })}
      </p>
    );
  }

  return (
    <span
      className={cn(
        "hidden rounded-md border px-2 py-1 text-xs text-muted-foreground sm:inline-flex",
        className
      )}
      title={t("title", {
        version: meta.gameVersionLabel,
        date: updated,
      })}
    >
      {meta.gameVersionLabel}
    </span>
  );
}
