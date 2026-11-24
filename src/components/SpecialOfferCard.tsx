import Link from 'next/link'
import Image from 'next/image'
import { resolveImageUrl } from '@/lib/images'
import { Stars } from '@/components/CasinoCard'
import { COPY } from '@/constants/copy'
import type { SpecialOffer } from '@shared/types/specialOffer'

/**
 * The bonus type whose cards carry a Claim button.
 *
 * WHY A TYPE AND NOT THE LINK. Claim used to appear on any offer that happened
 * to carry an affiliate URL, which made the card's primary action a property of
 * the data rather than an editorial decision: filing a bonus under "Free Spins"
 * or "Cashback" still produced a Claim button, because those offers have links
 * too. Claim now means one thing — this is a Special Offer — and whether the
 * offer has a link of its own no longer decides it.
 */
export const CLAIMABLE_BONUS_CATEGORY = 'special-offers'

/**
 * The grid the coupons sit in — the mockup's `.offers`:
 * `minmax(min(100%,350px),1fr)` with a 22px gutter.
 *
 * THE CARD IS CAPPED AT 560px, and the cap is on the CARD rather than on the
 * track. A bonus type holding a single offer was being given the whole 1192px
 * row — a 104px stub and two short lines stranded in a coupon five times
 * wider than anything in it — and the obvious fix, a definite max on the
 * track, made it worse in the other direction: `auto-fit` counts its
 * repetitions from a definite max, so `minmax(350px, 560px)` would pin every
 * grid on the site to two columns. With `1fr` the count still comes from the
 * 350px minimum, three coupons share a wide row as they should, and a lone
 * one simply stops at 560.
 *
 * `offer-grid` stays in the class list: it is the hook the `:nth-child` cycles
 * in globals.css hang off on the sibling sites, and keeping the name means a
 * caller can be moved between sites unchanged.
 */
export const OFFER_GRID = 'offer-grid grid grid-cols-1 gap-[22px] sm:grid-cols-[repeat(auto-fit,minmax(min(100%,350px),1fr))]'

/**
 * THE STUB'S THREE COLOURS, and the stable choice of one — the mockup's
 * `STUB = ['#E3361F','#1F4FE0','#141414']`, with the first deepened to the
 * red this whole site uses: white on #E3361F is 4.36:1 and the type on a stub
 * is 19px bold, which is only just large text. White on these three is 6.42,
 * 6.46 and 18.42.
 *
 * THE COLOUR IS RHYTHM AND CARRIES NO MEANING, and it is chosen from the
 * offer's own SLUG rather than from `:nth-child`, which is what the mockup
 * does. The reason: these grids are `auto-fit`, the API's ordering changes
 * whenever an offer is hidden, and a coupon that changes colour between the
 * home page and /special-offers reads as a property of the offer that keeps
 * moving. From the slug it is the same coupon everywhere.
 */
const STUB_TONES = ['#b7240f', '#1f4fe0', '#141414'] as const

/**
 * FNV-1a, not the `h * 31 + c` polynomial the rest of this network uses for
 * the same job, and the difference showed up in a browser: these slugs share
 * long suffixes ("…-casino-offer", "…-free-spin-offer"), a 31-multiply keeps
 * that structure in its low bits, and a whole bonus type came out with three
 * identical stubs in a row — which reads as the colour MEANING "special
 * offers" when it is meant to carry nothing at all. FNV's XOR-then-multiply
 * decorrelates the tail, so neighbouring slugs land on different tones.
 *
 * `Math.imul` because the multiply has to wrap at 32 bits; plain `*` would
 * overflow into a float and lose the low bits that do the work.
 */
function stubTone(slug: string): string {
  let h = 2166136261
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return STUB_TONES[Math.abs(h) % 3]
}

/** Up to two initials, for a casino with no logo artwork. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/**
 * An offer card for the listing grids — `.offer` in sites/linkshareasale.html.
 *
 * A TEAR-OFF COUPON: a 2px ink card with a colour STUB down its left side
 * carrying the bonus type set vertically, a dashed perforation beside it, and
 * two notches punched clean through the card at the ends of that line. See
 * `.offer` and `.o-notch` in globals.css for how the notches are made — the
 * card's `overflow: hidden` is what turns each disc into a semicircle bitten
 * out of the edge.
 *
 * goodnewsdrop also has a clip-out coupon and it is a different object: there
 * the whole card is a dashed box with scissors notched into its TOP rule.
 * Here the perforation runs down ONE SIDE and separates a stub from a body,
 * which is what a cloakroom ticket or a raffle book does.
 *
 * THE ORDER INSIDE IT IS THE SITE'S ORDER: whose offer it is, what it is
 * called, how it places, and only then the way in — because the decision is
 * made above the button, not at it.
 *
 * `logo` IS STILL ACCEPTED and deliberately NOT USED. A casino page passes
 * its own logo down because the offers it lists arrive without their casino
 * attached, and every sibling's card has a picture well to put it in. This
 * card has a stub where that well would be, so there is nowhere for it to go
 * — and dropping the prop from the signature would break three call sites for
 * nothing. It stays in the type and out of the layout.
 */
export default function SpecialOfferCard({ offer }: { offer: SpecialOffer; logo?: string | null }) {
  const casinoName = offer.casino?.name ?? ''
  const kind = offer.bonus_category_name ?? 'Bonus'
  const tone = stubTone(offer.slug)
  // Claim is a property of the bonus TYPE, not of whether a link happens
  // to be filled in. See CLAIMABLE_BONUS_CATEGORY.
  const claimable = offer.bonus_category_slug === CLAIMABLE_BONUS_CATEGORY

  return (
    <article className="offer grid min-h-[170px] max-w-[560px] grid-cols-[76px_minmax(0,1fr)] min-[26rem]:grid-cols-[104px_minmax(0,1fr)]">
      {/* THE PERFORATION'S TWO NOTCHES. Positioned on the stub's edge, and
          moved with it when the stub narrows below 26rem — the mockup does
          the same in its own `@media(max-width:420px)`. */}
      <span aria-hidden className="o-notch -top-3 left-[65px] min-[26rem]:left-[93px]" />
      <span aria-hidden className="o-notch -bottom-3 left-[65px] min-[26rem]:left-[93px]" />

      {/* THE STUB. `--c` is set inline because it is per-offer data, not a
          theme value — see stubTone above. `aria-hidden`: the kind is printed
          again in the kicker beside it, and a screen reader meeting a word
          set vertically twice learns nothing the second time. */}
      <div aria-hidden className="o-kind flex items-center justify-center px-2 py-4" style={{ ['--c' as string]: tone }}>
        <span className="text-[17px] min-[26rem]:text-[19px]">{kind}</span>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5 px-5 py-5 sm:px-6">
        {/* Whose offer it is, and which aisle — the mockup's `.by`, which
            names the casino alone. The kind is added because the stub beside
            it is `aria-hidden` and because this card also appears ungrouped
            on /special-offers, where nothing else says what sort of bonus it
            is. */}
        <p className="lbl min-w-0 text-[12.5px] tracking-[0.06em] text-muted [overflow-wrap:anywhere]">
          {casinoName ? `${casinoName} · ${kind}` : kind}
        </p>

        <h3 className="font-display cond-78 text-[25px] leading-[1.05] text-ink [overflow-wrap:anywhere]">
          <Link href={`/special-offers/${offer.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {offer.title}
          </Link>
        </h3>

        {offer.bonuses && (
          <p className="text-[15.5px] font-bold text-brand [overflow-wrap:anywhere]">{offer.bonuses}</p>
        )}

        {/* THE RATING, only when there IS one. An offer whose rating has
            never been set comes back as 0, and five empty stars beside a
            "0.0 / 5" does not read as "unrated" — it reads as rated zero,
            which is a worse claim than saying nothing. The mockup prints five
            filled stars on every offer regardless; this prints the figure the
            record actually holds, or nothing. */}
        {offer.rating > 0 && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Stars rating={offer.rating} />
            <span aria-hidden className="mono text-[13px] text-ink tabular-nums">
              {offer.rating.toFixed(1)}/5
            </span>
          </p>
        )}

        {/* THE FOOT — the mockup's `.o-foot`: the T&Cs line at the left and
            the way in at the right, wrapping to two rows when the coupon is
            narrow.

            `relative z-10` lifts the control over the heading's stretched
            link, or the card-wide hit area would swallow it. */}
        <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2">
          <p className="mono text-[12px] text-muted">T&amp;Cs apply · 18+</p>
          {claimable ? (
            offer.affiliate_url ? (
              <a
                href={offer.affiliate_url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="btn-or btn-xs btn-flat"
              >
                {COPY.specialOffers.claim}
                <span className="sr-only"> — {offer.title}</span>
              </a>
            ) : (
              // No affiliate URL of its own: the offer's page is the only place
              // that can lead to the operator. An internal link, so no sponsored rel.
              <Link href={`/special-offers/${offer.slug}`} className="btn-or btn-xs btn-flat">
                {COPY.specialOffers.claim}
                <span className="sr-only"> — {offer.title}</span>
              </Link>
            )
          ) : (
            <Link
              href={`/special-offers/${offer.slug}`}
              className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-brand underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Details
              <span className="sr-only"> — {offer.title}</span>
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

/**
 * An offer as a row inside a group: the logo, whose offer it is, its name and
 * amount, and on the right the way in. The whole row opens the offer (the
 * title link is stretched over it) and takes the page ground on hover.
 *
 * The SAME Claim rule as the card: Claim only for the Special Offers type —
 * to the casino when the offer has a link, to its own page when it has none.
 * Any other type shows "Details →".
 *
 * `heading` is the title's level: `h4` under a group card's `h3` (the home
 * page), `h3` where the rows sit straight under a section's `h2`.
 */
export function OfferRow({ offer, logo: logoOverride, heading: Heading = 'h4' }: { offer: SpecialOffer; logo?: string | null; heading?: 'h3' | 'h4' }) {
  const logo = logoOverride ?? resolveImageUrl(offer.casino?.image_path ?? offer.image_path)
  const claimable = offer.bonus_category_slug === CLAIMABLE_BONUS_CATEGORY
  const kicker = offer.casino?.name ?? offer.bonus_category_name ?? ''

  return (
    <li className="of relative grid grid-cols-[52px_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 border-b-2 border-dashed border-line px-4 py-4 last:border-b-0 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:px-5">
      {/* The plate is a small `.clogo` — white inside a 2px ink edge, for the
          reason given on that class: half the operator artwork carries its
          own white ground baked in. */}
      <span aria-hidden className="clogo flex h-[52px] w-[52px] items-center justify-center p-1.5 text-xs font-bold text-ink">
        {logo ? (
          <Image src={logo} alt="" width={104} height={104} sizes="52px" className="h-full w-full object-contain" />
        ) : (
          initials(kicker || offer.title)
        )}
      </span>
      <div className="min-w-0">
        {kicker && <p className="lbl text-[12px] text-muted">{kicker}</p>}
        <Heading className="font-display mt-0.5 text-[19px] leading-[1.1] text-ink [overflow-wrap:anywhere]">
          <Link href={`/special-offers/${offer.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {offer.title}
          </Link>
        </Heading>
        {offer.bonuses && <p className="text-[15px] font-bold text-brand [overflow-wrap:anywhere]">{offer.bonuses}</p>}
      </div>
      <div className="relative z-10 col-span-2 flex items-center justify-end gap-3 sm:col-span-1">
        {claimable ? (
          offer.affiliate_url ? (
            <a href={offer.affiliate_url} target="_blank" rel="nofollow sponsored noopener" className="btn-or btn-xs btn-flat">Claim</a>
          ) : (
            // No affiliate URL of its own: the offer's page is the only place
            // that can lead to the operator. An internal link, so no sponsored rel.
            <Link href={`/special-offers/${offer.slug}`} className="btn-or btn-xs btn-flat">Claim</Link>
          )
        ) : (
          <span aria-hidden className="inline-flex items-center text-[14px] font-bold text-brand">Details →</span>
        )}
      </div>
    </li>
  )
}
