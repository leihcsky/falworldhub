"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, locales, type AppLocale } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Language switcher.
 * Only one locale is active in MVP; adding locales to `routing.ts`
 * will surface them here automatically.
 */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  if (locales.length < 2) {
    return null;
  }

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (!value) return;
        router.replace(pathname, { locale: value as AppLocale });
      }}
    >
      <SelectTrigger aria-label={t("label")} size="sm" className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((item) => (
          <SelectItem key={item} value={item}>
            {localeNames[item]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
