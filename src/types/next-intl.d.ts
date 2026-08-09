import en from "../../messages/en.json";

type Messages = typeof en;

declare module "next-intl" {
  interface AppConfig {
    Locale: import("@/i18n/routing").AppLocale;
    Messages: Messages;
  }
}
