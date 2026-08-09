import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/" className={cn(buttonVariants())}>
          {t("home")}
        </Link>
        <Link
          href="/breeding-calculator"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {t("calculator")}
        </Link>
      </div>
    </div>
  );
}
