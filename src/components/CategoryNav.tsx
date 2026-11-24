import Link from 'next/link'
import { resolveImageUrl } from '@/lib/images'
import type { Category } from '@shared/types/category'

/**
 * Link Share a Sale category tabs, from sites/linkshareasale.html
 * (`.tabs` / `.tab`): a row of white pills on 2px ink edges, washing yellow
 * when pointed at, and the current one filled SOLID INK with its count in
 * yellow.
 *
 * 18.42:1 and 12.92:1 — the two strongest pairs on the site, spent here on
 * purpose, because this is the one control that changes what is below it and
 * it has to be unmistakable which pill is on.
 *
 * THEY SCROLL SIDEWAYS, which is the mockup's own
 * (`.tabs{flex-wrap:nowrap;overflow-x:auto}`) and is a real trade. Seven
 * pills at ~160px come to about 1120px, so at this page's 1240px measure the
 * whole set sits in the row UNSCROLLED and the scroll only engages on a
 * narrow window or a phone. There it is a horizontal swipe over objects that
 * obviously continue past the edge, which is a gesture people already have.
 * `no-scrollbar` hides the bar; `pr-6` leaves the last pill's offset shadow
 * somewhere to land instead of being cut off mid-stroke by the scroll port.
 *
 * THE MOCKUP'S COUNTRY SELECT IS NOT HERE. Its filter row opens with an "All
 * Countries" dropdown driven by a hard-coded `geo` field on each casino in
 * its demo data. The API has countries, but nothing scopes a casino LIST by
 * one — /countries/<slug> is its own page with its own rules — so a select
 * here would either do nothing or quietly filter on a field that does not
 * mean what its label says. The regions appear on each tag instead.
 *
 * The tabs NAVIGATE rather than filter in place: always the canonical
 * /categories/<slug> route. The query forms (`/?category=`,
 * `/casinos?category=`) are 301'd to it at the edge (lib/seo/redirects.ts), so
 * linking either would spend a redirect per visitor and crawl budget on URLs
 * that resolve elsewhere.
 */
export default function CategoryNav({
  categories,
  selected,
}: {
  categories: Category[]
  selected: string
}) {
  return (
    <nav aria-label="Casino categories" className="mb-10">
      <ul className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto py-1 pr-6" role="list">
        {categories.map((c) => {
          const active = c.slug === selected
          return (
            <li key={c.id} className="flex flex-none">
              <Link
                href={`/categories/${c.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`tab flex min-h-11 items-center gap-2 whitespace-nowrap px-4 text-[15px] font-bold ${
                  active ? 'tab-on' : ''
                }`}
              >
                {/* The category's own icon, as in the Casinos menu. A plain <img>:
                    next/image refuses SVG. alt="" because the label names it. */}
                {c.logo_path && (
                  <img src={resolveImageUrl(c.logo_path)!} alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
                )}
                <span>{c.name}</span>
                {typeof c.casinos_count === 'number' && (
                  /* The mockup's `.tab .n`: the count in a 22px disc beside
                     the label. Both its colours live in globals.css beside
                     `.tab-on`, for the same layering reason the active tab
                     does — a `bg-*` here would lose to the unlayered `.tab`
                     and win over nothing. */
                  <span className="tab-count grid h-[22px] min-w-[22px] place-items-center px-1.5 text-[12px] font-semibold tabular-nums">
                    {c.casinos_count}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
