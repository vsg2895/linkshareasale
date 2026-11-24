import Link from 'next/link'
import { resolveImageUrl } from '@/lib/images'
import { COPY } from '@/constants/copy'
import type { BonusSection } from '@/lib/api'

/**
 * The catch-all heading, which the mix deliberately leaves out.
 *
 * Every offer not filed under a real type lands under "Special Offers", so it
 * is not a type at all — it is the whole area, already reachable from the nav
 * and the offers page. Hidden here rather than in the admin: the admin's
 * "Shown" switch would also remove it from the menu and the sections.
 */
export const CATCH_ALL_SLUG = 'special-offers'

/**
 * THE AISLES — `.aisles` / `.aisle` in sites/linkshareasale.html.
 *
 * Each bonus type is a numbered aisle: AISLE 01, a line drawing of what is in
 * it, the type's name set in condensed capitals, and how many offers are on
 * the shelf. White cards on 2px ink edges that go YELLOW when pointed at —
 * the only place on this site where a whole object changes colour rather than
 * moving, which is why it is spent on the block a reader is most likely to
 * be scanning rather than reading.
 *
 * ── Two details that are deliberate ───────────────────────────────────────
 *
 * THE NUMBER IS NOT A RANKING. "Aisle 04" is a location, not a position: the
 * aisles arrive in the admin's own priority order, which is an editorial sort
 * of the types and not a judgement of them. Setting it in the till face
 * rather than the display one is what keeps it reading as a sign on a shelf
 * instead of a score.
 *
 * THE COUNT IS VISIBLE TEXT, not a screen-reader aside. On most of the
 * sibling sites it is a chip the eye can skip; here it is the one piece of
 * information that tells a reader which aisle is worth walking down, so it is
 * set as words — "4 offers" — under the name, as the mockup draws it.
 *
 * This component renders NO HEADING. The section's head — its title and
 * kicker — is drawn by the page's own `SectionHead`, and a second <h2>
 * carrying the same id as that one is a duplicate id, not a heading.
 *
 * Each aisle opens that type's own page. The counts are the SITE's — active,
 * claimable, owned by a casino attached here — resolved server-side. Renders
 * nothing when the site has no Bonus area or every type is empty.
 */
export default function BonusCategoryNav({ sections }: { sections: BonusSection[] }) {
  const types = sections.filter((section) => section.slug !== CATCH_ALL_SLUG)
  if (types.length === 0) return null

  return (
    <ul
      className="btypes grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-3.5"
      role="list"
    >
      {types.map((section, i) => (
        <li key={section.id} className="flex min-w-0">
          <Link
            href={`/bonuses/${section.slug}`}
            className="btype flex w-full flex-col gap-2.5 px-[18px] pb-5 pt-[18px]"
          >
            <span className="flex items-center justify-between gap-3">
              <span aria-hidden className="btype-no text-[12.5px] uppercase tracking-[0.06em]">
                {COPY.bonusCategory.aisleLabel} {String(i + 1).padStart(2, '0')}
              </span>
              {/* What is in the aisle — the mockup's `.aisle svg`: a 30px ink
                  line drawing. A plain <img> for an uploaded mark:
                  next/image refuses SVG. alt="" because the name below says
                  the type.

                  NO PLATE BEHIND AN UPLOADED MARK. The admin's own type icons
                  already arrive as coloured rounded squares, and a ground
                  behind one renders as two nested shapes in two colours. The
                  fallback drawing has no ground either: on this site the icon
                  is a line, not a tile. */}
              <span aria-hidden className="btype-ic h-[30px] w-[30px] shrink-0">
                {section.icon_path ? (
                  <img src={resolveImageUrl(section.icon_path)!} alt="" width={30} height={30} className="h-full w-full object-contain" />
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-full w-full">
                    <rect x="3" y="8" width="14" height="9" />
                    <path d="M2 5h16v3H2zM10 5v12M10 5c-2-3-5-2-4 0M10 5c2-3 5-2 4 0" />
                  </svg>
                )}
              </span>
            </span>

            <b className="font-display mt-2.5 text-[22px] leading-none text-ink [overflow-wrap:anywhere]">
              {section.name}
            </b>

            <span className="btype-ct text-[13px] tabular-nums">
              {section.offers_count}{' '}
              {section.offers_count === 1 ? COPY.bonusCategory.countOne : COPY.bonusCategory.countMany}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
