import Image from 'next/image'
import Link from 'next/link'
import { resolveImageUrl } from '@/lib/images'
import { COPY } from '@/constants/copy'
import type { CasinoWithAttachment } from '@shared/types/casino'

/** How many regions a tag names before collapsing the rest into a count. */
const REGIONS_SHOWN = 3

/**
 * Exported so an offer coupon shows the same stars a tag does.
 *
 * `--color-gold` is this site's own red, #B7240F — the mockup sets its stars
 * in `--red` #E3361F, which is 4.36:1 on white and 3.87 on the paper. A star
 * row is a graphic, so 3:1 would have been the bar and the bright red clears
 * it; it is deepened anyway because the FIGURE printed beside the stars is
 * text at 13.5px and has to clear 4.5, and one red for both is one fewer
 * thing to get wrong.
 *
 * THE EMPTY STAR NEEDS ITS OWN VALUE. The mockup tells a filled star from an
 * empty one by GLYPH (★ against ☆) and leaves both the same colour; this
 * network's shared `Stars` tells them apart by colour, so the unfilled one
 * takes #8A857B — 3.67:1 on white and 3.25 on the paper. The mockup's own
 * hairline #D6D0C2 is 1.54 and would have been invisible.
 */
export function Stars({ rating, onDark = false }: { rating: number; onDark?: boolean }) {
  // `Math.round` rather than a partial star: the ratings are whole or half
  // numbers and a half-filled glyph at 17px reads as a rendering fault.
  const filled = Math.round(rating)
  const on = onDark ? 'text-accent' : 'text-gold'
  const off = onDark ? 'text-night-line' : 'text-star-empty'

  return (
    <span
      className="inline-flex items-center tracking-[1px] text-[16px] leading-none"
      role="img"
      aria-label={`${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < filled ? on : off} aria-hidden>
          ★
        </span>
      ))}
    </span>
  )
}

/**
 * The rail the tags hang on — the mockup's `.list`: three across, two at
 * 1100px, one at 640px, with a 28px gutter and a 40px gap between rows.
 *
 * THE ROW GAP IS LARGER THAN THE COLUMN GAP, and that is structural rather
 * than decorative: every tag hangs from a string that stands 30px above it,
 * and a uniform gutter would put that string through the bottom of the tag
 * above. `pt-[18px]` does the same job for the first row.
 *
 * `tag-list` is the hook the rotation cycle in globals.css hangs off. It has
 * to be on the element whose CHILDREN are the tags, because the cycle is
 * `:nth-child`.
 */
export const CASINO_LIST =
  'tag-list grid grid-cols-1 gap-x-7 gap-y-10 pt-[18px] min-[40rem]:grid-cols-2 min-[69rem]:grid-cols-3'

/**
 * A casino as A PRICE TAG — `.tag` in sites/linkshareasale.html.
 *
 * A white swing tag hanging off a kraft string: both top corners cut away, a
 * punched hole, the operator's plate and name, the bonus on a yellow price
 * block, the regions it accepts between dashed rules, and two buttons at the
 * foot. It sits a fraction off true and straightens when it is pointed at,
 * which is what picking a tag up to read it does.
 *
 * ── Why this is four nested elements ──────────────────────────────────────
 *
 * The cut shoulder is a `clip-path`, and `clip-path` clips the border off
 * with everything else — so the outline is four `drop-shadow` filters on a
 * wrapper (see `.tagwrap` in globals.css). That is one level. The rotation
 * is a third element because `filter` and `transform` on the same box fight
 * over the rendering order and the shadow ends up rotating out of register
 * with the edge it is tracing. And the string and the leader's sticker have
 * to sit OUTSIDE the clip entirely or they are cut away with the corners.
 *
 * So: `<li>` → the rotator → the outliner → the tag. Each one does exactly
 * one thing, and none of them can be merged into its neighbour.
 *
 * ── Three things the mockup draws that are not shipped ────────────────────
 *
 * ITS `.facts` ROW — "Min. deposit" and "Payout" under every tag. No column
 * in this project holds either, so both would be invented per casino. The
 * irony is noted in constants/copy.ts: the deposit IS the first part of the
 * price this site is about. The slot carries the REGIONS instead, which are
 * real, and which decide whether the price is one you are allowed to pay at
 * all.
 *
 * ITS INK LOGO PLATE. The mockup fills the plate with ink and sets the
 * operator's name on it in yellow. Roughly half the operator artwork in this
 * catalogue is a JPEG with its own white ground baked in, and every one of
 * those renders as a white rectangle floating in a black square — every site
 * in this network that tried a dark plate hit it. The plate is WHITE with the
 * same 2px ink edge everything else here has; the FALLBACK, where there is no
 * artwork to fight, keeps the mockup's ink fill and yellow lettering.
 *
 * NO RANK NUMERAL, which is the network rule — the `<ol>` order is the
 * ranking. `rank` drives the leader's sticker and is `rank === 1` rather than
 * `:first-child`, so page 2 of /casinos does not crown its own first row.
 */
export default function CasinoCard({
  casino,
  rank,
}: {
  casino: CasinoWithAttachment
  rank?: number
}) {
  // The casino's "Image" (logo), NOT the wide "Banner Image" used big on the
  // casino page. Falls back to the banner if there is no Image.
  const image = resolveImageUrl(casino.image_path ?? casino.banner_image)

  const regions = casino.countries ?? []
  const shownRegions = regions.slice(0, REGIONS_SHOWN)
  const extraRegions = regions.length - shownRegions.length
  const isLeader = rank === 1

  return (
    <li className="flex">
      <div className="ccard-rot relative flex w-full pt-[30px]">
        {/* The string. Above the tag and IN FRONT of it (`z-[2]`), so it
            reads as passing through the punched hole rather than stopping at
            the shoulder. */}
        <span aria-hidden className="tag-string absolute left-1/2 top-0 z-[2] h-12 w-[2px] -translate-x-1/2" />

        {/* The leader's sticker — outside the clip, or the cut shoulder would
            take a bite out of it. `top-6` and not the mockup's `-6px`,
            because this wrapper starts 30px ABOVE the tag to make room for
            the string: measured from here, the tag's own top edge is at 30,
            so 24 puts the sticker 6px over it exactly as drawn. */}
        {isLeader && (
          <span className="flag font-display absolute -right-2.5 top-6 z-[3] whitespace-nowrap px-3.5 py-2 text-[15px] tracking-[0.04em]">
            {COPY.casinos.topPick}
          </span>
        )}

        {/* The outliner. Nothing but the four drop-shadows. */}
        <div className="tagwrap w-full">
          <article className="ccard flex w-full flex-col gap-3.5 px-6 pb-6 pt-[46px]">
            {/* The punched hole. */}
            <span aria-hidden className="tag-hole absolute left-1/2 top-3.5 h-[18px] w-[18px] -translate-x-1/2" />

            <div className="flex min-w-0 items-center gap-3.5">
              {/* THE PLATE. A fixed 78px square at every width: operator
                  artwork runs from square to wide banner, and a plate that
                  sized itself to each file would make one tag's name 139px
                  wide and the next one's 60. */}
              <div
                className={`grid h-[78px] w-[78px] flex-none place-items-center overflow-hidden p-2 ${
                  image ? 'clogo' : 'clogo clogo-empty'
                }`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`${casino.name} logo`}
                    width={156}
                    height={156}
                    sizes="78px"
                    className="max-h-[56px] w-full object-contain"
                  />
                ) : (
                  <span className="font-display cond-65 px-0.5 text-center text-[14px] leading-none text-accent [overflow-wrap:break-word]">
                    {casino.name}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="cc-name font-display text-[26px] text-ink [overflow-wrap:anywhere] sm:text-[30px]">
                  {/* `inline-flex min-h-11`: the name IS a way into the
                      review, and at 30px its link box was 30px tall — well
                      under the 44px tap target. A floor, not a fixed height,
                      so a two-line operator name still grows the box. */}
                  <Link href={`/casinos/${casino.slug}`} className="inline-flex min-h-11 items-center">
                    {casino.name}
                  </Link>
                </h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Stars rating={casino.rating} />
                  {/* The figure, always. A rating is the one place this design
                      asks a colour to carry a VALUE, and a number beside it
                      means the colour never has to. */}
                  <span aria-hidden className="mono text-[13.5px] text-ink tabular-nums">
                    {casino.rating.toFixed(1)}/5
                  </span>
                </p>
              </div>
            </div>

            {/* THE PRICE BLOCK — the mockup's `.price`: the figure on the
                yellow, which is the loudest thing on a tag and should be,
                because it is the thing a shopper reads first. Ink on it is
                12.92:1, and the 2px ink border is not optional: the yellow is
                1.26:1 against the paper and has no shape without it. */}
            {casino.bonuses && (
              <p className="deep-panel px-4 py-3.5">
                <span className="lbl block text-[12px] text-ink">{COPY.casinos.bonusLabel}</span>
                <b className="font-display cond-78 mt-1 block text-[23px] leading-[1.08] text-ink [overflow-wrap:anywhere]">
                  {casino.bonuses}
                </b>
              </p>
            )}

            {/* THE REGIONS, in the slot the mockup gives its two invented
                facts, between the same dashed rules. One wrapper child, so
                the `.facts > * + *` divider never fires on a chip. */}
            {shownRegions.length > 0 && (
              <div className="facts py-2.5">
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="sr-only">Accepted countries: </span>
                  {shownRegions.map((c) => (
                    <span
                      key={c.id}
                      className="lbl inline-flex items-center rounded-full bg-win-bg px-2.5 py-1 text-[12px] tracking-[0.04em] text-win"
                    >
                      {c.name}
                    </span>
                  ))}
                  {extraRegions > 0 && (
                    <span className="lbl inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[12px] tracking-[0.04em] text-ink-soft">
                      +{extraRegions} more
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* THE ACTIONS — the mockup's `.t-act`: two buttons side by side,
                dropping to one column below 420px, pinned to the foot of the
                tag by `mt-auto` so every tag in a row ends on the same line.

                `btn-flat` on both: the tag itself straightens and lifts when
                it is pointed at, and a button travelling inside it at the
                same time makes the whole thing look loose. */}
            <div className="mt-auto grid grid-cols-1 gap-3 pt-1 min-[26rem]:grid-cols-2">
              <a
                href={casino.attachment.affiliate_url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="btn-or btn-sm btn-flat px-2.5"
              >
                {COPY.casinos.visitCasino}
                <span className="sr-only"> — {casino.name}</span>
              </a>
              <Link href={`/casinos/${casino.slug}`} className="btn-ln btn-sm btn-flat px-2.5">
                {COPY.casinos.readReview}
                <span className="sr-only"> of {casino.name}</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </li>
  )
}
