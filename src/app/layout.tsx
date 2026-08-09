import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

/** Root passthrough — `<html>` / `<body>` live in `[locale]/layout`. */
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
