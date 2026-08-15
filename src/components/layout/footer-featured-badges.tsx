const FEATURED_BADGES = [
  {
    href: "https://saasgrow.app?ref=palworldhub.best",
    src: "https://saasgrow.app/api/badge?type=featured&style=light",
    alt: "palworld hub on SaaSGrow",
    width: 240,
    height: 54,
  },
  {
    href: "https://findly.tools/palworld-hub?utm_source=palworld-hub",
    src: "https://findly.tools/badges/findly-tools-badge-light.svg",
    alt: "Featured on Findly.tools",
    width: 175,
    height: 55,
  },
  {
    href: "https://shipstry.com/",
    src: "https://shipstry.com/badges/featured.svg",
    alt: "Featured on Shipstry",
    width: 220,
    height: 52,
  },
  {
    href: "https://toolfame.com/item/palworld-hub",
    src: "https://toolfame.com/badge-light.svg",
    alt: "Featured on toolfame.com",
    width: 200,
    height: 54,
  },
  {
    href: "https://showmebest.ai",
    src: "https://showmebest.ai/badge/feature-badge-white.webp",
    alt: "Featured on ShowMeBestAI",
    width: 220,
    height: 60,
  },
] as const;

function BadgeRow({
  badges,
  ariaHidden,
}: {
  badges: typeof FEATURED_BADGES;
  ariaHidden?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-3 pr-3"
      aria-hidden={ariaHidden || undefined}
    >
      {badges.map((badge) => (
        <a
          key={badge.href}
          href={badge.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0"
          tabIndex={ariaHidden ? -1 : undefined}
        >
          {/* External badge assets; plain img avoids next/image remote config. */}
          <img
            src={badge.src}
            alt={ariaHidden ? "" : badge.alt}
            width={badge.width}
            height={badge.height}
            className="h-[54px] w-auto"
          />
        </a>
      ))}
    </div>
  );
}

/** Fixed-width looping strip for directory / featured badges. */
export function FooterFeaturedBadges() {
  return (
    <div className="footer-badge-marquee max-w-sm">
      <div className="footer-badge-marquee-track">
        <BadgeRow badges={FEATURED_BADGES} />
        <BadgeRow badges={FEATURED_BADGES} ariaHidden />
      </div>
    </div>
  );
}
