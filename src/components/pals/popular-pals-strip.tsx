import type { Pal } from "@/types";
import { PalImage } from "@/components/pals/pal-image";
import { Link } from "@/i18n/navigation";

type PopularPalsStripProps = {
  pals: Pal[];
  title: string;
  description: string;
};

/** Compact secondary row — keeps search above the fold. */
export function PopularPalsStrip({
  pals,
  title,
  description,
}: PopularPalsStripProps) {
  if (pals.length === 0) return null;

  return (
    <section className="space-y-3 border-t pt-10">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="flex flex-wrap gap-3">
        {pals.map((pal) => (
          <li key={pal.id}>
            <Link
              href={`/pals/${pal.slug}`}
              className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:border-foreground/20 hover:bg-muted/40"
            >
              <PalImage src={pal.image} alt="" size={28} />
              <span>{pal.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
