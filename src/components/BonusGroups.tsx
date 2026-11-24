import Link from 'next/link'
import { COPY } from '@/constants/copy'
import SpecialOfferCard, { OFFER_GRID } from '@/components/SpecialOfferCard'
import type { BonusSection } from '@/lib/api'

/**
 * The home page's "Bonus Coupons": one SUBHEAD per aisle over a grid of that
 * aisle's coupons — the mockup's `.subh` + `.offers`.
 *
 * THE SUBHEAD IS A RULED LABEL, not a card's head band: the aisle's name in
 * the till face, with a 2px INK rule running from the end of the words to the
 * right margin and the "see more" link at the end of that line. The mockup
 * draws the rule with `.subh::after{flex:1;height:2px}`; it is a real flex
 * child here, which is the same thing and can carry a `bg-*` token.
 *
 * No card around a group, which is where this differs from most of the
 * network — the siblings wrap each type in a card with a coloured head band.
 * It cannot work here: a coupon is already a bordered card with a notch
 * punched out of each edge, and a container around three of them would be a
 * box holding boxes with holes in. The rule IS the container: it draws the
 * shelf the coupons sit under.
 *
 * The rule is 2px rather than a hairline because that is the weight of every
 * other structural line on this site — the header's, the section heads', the
 * border on every object.
 *
 * The count is resolved server-side over the unlimited set, so it is the
 * number of offers of this kind on the whole site rather than the number of
 * coupons under it. It is `sr-only` here: the aisle in the section above
 * prints it as words, and a figure beside a label that is itself beside a
 * rule is three objects on one line.
 *
 * Every aisle's coupons are in the server HTML, and each group keeps the
 * `#bonus-<slug>` anchor the aisle cards land on.
 */
export default function BonusGroups({ sections }: { sections: BonusSection[] }) {
  if (sections.length === 0) return null

  return (
    <div className="flex flex-col gap-14">
      {sections.map((section) => (
        <section
          key={section.id}
          id={`bonus-${section.slug}`}
          aria-labelledby={`bonus-${section.slug}-heading`}
          className="scroll-mt-28"
        >
          <div className="mb-[18px] flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <h3
              id={`bonus-${section.slug}-heading`}
              className="lbl min-w-0 text-[13.5px] text-ink [overflow-wrap:anywhere]"
            >
              {section.name}
              <span className="sr-only">
                {' '}— {section.offers_count}{' '}
                {section.offers_count === 1 ? COPY.bonusCategory.countOne : COPY.bonusCategory.countMany}
              </span>
            </h3>
            {/* The rule, from the end of the words to the link. `min-w-6` so
                it never collapses to nothing on a narrow row. */}
            <span aria-hidden className="h-[2px] min-w-6 flex-1 bg-ink" />
            <Link
              href={`/bonuses/${section.slug}`}
              className="inline-flex min-h-11 flex-none items-center text-[15px] font-bold text-sea underline-offset-4 transition-colors hover:text-brand hover:underline"
            >
              {COPY.home.seeMore}
              <span className="sr-only"> {section.name}</span>{' '}
              <span aria-hidden className="ml-1.5">→</span>
            </Link>
          </div>
          {section.description && (
            <p className="mb-6 max-w-[640px] text-[15.5px] text-ink-soft">{section.description}</p>
          )}
          <div className={OFFER_GRID}>
            {section.offers.map((offer) => (
              <SpecialOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
