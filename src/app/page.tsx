import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBonusArea, getCategories, getCategory, getSpecialOffers } from '@/lib/api'
import type { BonusSection } from '@/lib/api'
import { buildItemListSchema, buildWebPageSchema, jsonLdScript, buildFaqSchema, SHARE_IMAGES } from '@/lib/seo'
import { COPY } from '@/constants/copy'
import { WRAP, WRAP_NARROW } from '@/constants/layout'
import { FAQ_ITEMS } from '@/constants/faq'
import CasinoCard, { CASINO_LIST } from '@/components/CasinoCard'
import BonusCategoryNav from '@/components/BonusCategoryNav'
import BonusGroups from '@/components/BonusGroups'
import CategoryNav from '@/components/CategoryNav'
import FaqAccordion from '@/components/FaqAccordion'
import SpecialOfferCard, { OFFER_GRID } from '@/components/SpecialOfferCard'
import type { Category } from '@shared/types/category'
import type { CasinoWithAttachment } from '@shared/types/casino'
import type { SpecialOffer } from '@shared/types/specialOffer'
import { SITE_URL } from '@/lib/config'
import { casinosHeading } from '@/lib/categories'

/** Offers shown per bonus type in the home page's Bonuses section — one row. */
const HOME_BONUSES_PER_CATEGORY = 3

/** The page measure — the mockup's `.wrap` and `.narrow`. IMPORTED rather
 *  than redeclared, because the header, the subscribe strip and the footer
 *  are drawn in the layout and all five columns have to line up. The clone
 *  declared its own here and shipped three different widths. */

/**
 * Splits a sentence around one phrase so the page can set that phrase apart
 * — the mockup's `<em>` in the hero headline, drawn by `.hl` in globals.css.
 *
 * The phrase is named in COPY rather than marked up there, so the sentence
 * stays plain text and can go straight into a <title> or a JSON-LD field with
 * no tags to strip. If the phrase ever stops matching the sentence (an edit to
 * one and not the other), this returns the sentence whole and it simply
 * renders unmarked — a missing highlight, not a broken paragraph.
 */
function splitOnPhrase(text: string, phrase: string): [string, string, string] {
  const at = phrase ? text.indexOf(phrase) : -1
  if (at === -1) return [text, '', '']
  return [text.slice(0, at), phrase, text.slice(at + phrase.length)]
}

/**
 * Splits a heading before its LAST WORD, so a section head can set that word
 * in the red — the mockup's `.sec-head h2 em`, which it applies to every
 * section head on the page.
 *
 * DERIVED rather than marked up in COPY, and that is a deliberate trade. The
 * alternative is a second key beside every title, which doubles the number of
 * strings an editor has to keep in step for a gesture that is purely
 * typographic — and the key structure is shared with thirteen sibling sites
 * that do not have this gesture at all.
 *
 * A one-word heading returns no tail and renders in one colour, which is
 * correct: there is nothing to set a single word off against.
 */
function lastWord(title: string): [string, string] {
  const at = title.trimEnd().lastIndexOf(' ')
  if (at === -1) return [title, '']
  return [title.slice(0, at + 1), title.slice(at + 1)]
}

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? ''
const YEAR = new Date().getFullYear()

type Props = { searchParams: Promise<{ category?: string; page?: string }> }

// Resolve the selected category (default = first/highest-priority) for the home casinos section.
async function resolveCategory(searchParams: Props['searchParams']) {
  const sp = await searchParams
  const categories = (await getCategories()).data
  const selected =
    sp.category && categories.some((c) => c.slug === sp.category) ? sp.category : categories[0]?.slug
  return { categories: categories as Category[], selected }
}

export async function generateMetadata(): Promise<Metadata> {
  const title = `${COPY.home.homeTitle} ${YEAR} | ${SITE_NAME}`
  const description = COPY.home.metaDescription
  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: { type: 'website', url: '/', siteName: SITE_NAME, title, description, images: SHARE_IMAGES },
    twitter: { card: 'summary_large_image', title, description, images: SHARE_IMAGES },
  }
}

export default async function HomePage({ searchParams }: Props) {
  /*
   * THE HOME PAGE HAS ONE PAGE, so `?page=2` is a page past the end.
   *
   * Nothing here is paginated (the full list is /casinos), yet `/?page=2` and
   * every other number a crawler guessed answered 200 with the whole home page
   * and an `index` robots tag: a duplicate of `/` at a URL of its own. A 404
   * says it is not a page at all, the rule every paginated listing here applies
   * past its last page. `?page=1` never reaches this: proxy.ts 301s it to `/`.
   */
  if (Math.max(1, Number((await searchParams).page) || 1) > 1) notFound()

  const { categories, selected } = await resolveCategory(searchParams)

  const [categoryRes, offersRes, bonusRes] = await Promise.allSettled([
    selected ? getCategory(selected) : Promise.resolve(null),
    getSpecialOffers(selected, 6),
    // The bonus TYPES: the chip row under the hero AND the per-type Bonuses
    // section further down, so each type brings its first
    // HOME_BONUSES_PER_CATEGORY offers (one full row of the three-up grid).
    // The chips only read names, marks and counts, which the server counts
    // over the unlimited set. allSettled means a site without the Bonus area
    // renders neither, and falls back to the plain Special offers grid.
    getBonusArea(HOME_BONUSES_PER_CATEGORY),
  ])

  // Empty when the site does not publish the Bonus area, or when the
  // request failed — the strip renders nothing either way.
  const bonusSections: BonusSection[] = bonusRes.status === 'fulfilled' ? bonusRes.value : []

  const catData =
    categoryRes.status === 'fulfilled' && categoryRes.value ? categoryRes.value.data : null
  const casinos: CasinoWithAttachment[] = catData?.casinos ?? []
  const activeCategory = catData?.category ?? null
  // "See More" is only an affordance when there is actually more: compare the
  // category's full count against the rows this page received, rather than
  // hard-coding the page size on both sides where the two could drift apart.
  const hasMoreCasinos = (catData?.meta?.total ?? 0) > casinos.length
  // Offers are already scoped to the selected category and capped by the backend (?category=&limit=).
  const topOffers: SpecialOffer[] = offersRes.status === 'fulfilled' ? offersRes.value.data : []

  // Whether there is anywhere for the hero's second button to go. Taken from
  // `bonusSections`, which is already fetched — the clone asked the API a
  // third question for this and then rendered the same thing either way.
  const anyOffersVisible: boolean = bonusSections.length > 0 || topOffers.length > 0

  // Organization schema is emitted site-wide from the root layout; the home
  // page only adds its page-specific ItemList of top casinos.
  //
  // The list is the SELECTED category, not the whole catalogue, so it is named
  // and addressed as that category — it previously claimed the generic name
  // "Top Casinos at <brand>" and pointed at /casinos, describing neither the
  // rows below it nor a URL that renders them.
  const listSchema = buildItemListSchema(
    activeCategory ? `${activeCategory.name} — ${COPY.home.topCasinosTitle}` : COPY.home.topCasinosTitle,
    selected ? `${SITE_URL}/categories/${selected}` : `${SITE_URL}/casinos`,
    casinos.map((c, i) => ({ position: i + 1, name: c.name, url: `${SITE_URL}/casinos/${c.slug}` })),
  )

  const graph = [
    buildWebPageSchema({
      // Mirrors the actual <title>. The previous "Best Online Casinos <year>"
      // was generic boilerplate shipped identically by the sibling domains and
      // matched neither this page's title nor its H1.
      name: `${COPY.home.homeTitle} ${YEAR}`,
      url: SITE_URL,
      description: COPY.home.metaDescription,
    }),
    listSchema,
    // Same array the section below renders — markup-only FAQ is a violation.
    buildFaqSchema(SITE_URL, FAQ_ITEMS),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />

      <main>
        {/* THE HERO — the mockup's `.hero-grid`: the claim on the left and
            THE RECEIPT on the right, on a `1.15fr / .85fr` grid that
            collapses to one column at 940px.

            The claim gets the LARGER track here, the opposite of the way most
            of this network splits a hero, because the headline is six words
            of 132px condensed capitals and the receipt is a fixed 440px
            object that does not want to be any wider. */}
        <section className="pb-8 pt-[44px] sm:pt-16" aria-labelledby="hero-headline">
          <div className={`${WRAP} grid grid-cols-1 items-center gap-12 min-[59rem]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] min-[59rem]:gap-14`}>
            <div>
              {/* The eyebrow — the mockup's `.hero .lbl`: a yellow pill on a
                  2px ink edge, with a dot. Ink on the yellow is 12.92:1. */}
              <span className="lbl inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border-2 border-ink bg-accent px-3 py-1.5 text-[13px] text-ink">
                <span aria-hidden className="beat h-2 w-2 flex-none" />
                {COPY.home.heroEyebrow}
              </span>

              {/* THE HEADLINE. The mockup's device, with its words turned
                  round: a struck-out phrase over a coloured one. See
                  constants/copy.ts for why "Full price / Better deals" could
                  not ship on a page arguing that there IS a price.

                  `.strike` draws the bar in the BRIGHT red at -4°, which is
                  the one and only place #E3361F appears on this site: it is a
                  rule with no text on it, so 3.87:1 against the paper is the
                  bar it has to clear. */}
              <h1
                id="hero-headline"
                className="font-display my-[22px] text-[clamp(54px,9vw,132px)] leading-[1.02] text-ink"
              >
                <span className="strike">{COPY.home.heroStrike}</span>
                <br />
                {COPY.home.heroHeadline} <em className="hl not-italic">{COPY.home.heroHighlight}</em>
                {COPY.home.heroHeadlineTail}
              </h1>

              <p className="mb-7 max-w-[540px] text-[clamp(17px,1.6vw,20px)] text-ink-soft">
                {(() => {
                  const [before, mark, after] = splitOnPhrase(COPY.home.heroSubtitle, COPY.home.heroSubtitleMark)
                  return mark ? (
                    <>
                      {before}
                      <b className="font-bold text-ink">{mark}</b>
                      {after}
                    </>
                  ) : (
                    COPY.home.heroSubtitle
                  )
                })()}
              </p>

              <div className="flex flex-wrap gap-3.5">
                <Link href="#casinos" className="btn-or">{COPY.home.featuredCasinos}</Link>
                {anyOffersVisible && (
                  <Link href="#bonuses" className="btn-ln">{COPY.home.specialOffers}</Link>
                )}
              </div>

              {/* THE DISCLOSURE, above the fold. The mockup puts two PROOF
                  FIGURES here — "Real money / tested at every casino" and
                  "Weekly / terms re-checked" — and neither ships: see
                  constants/copy.ts. What belongs above the fold on a site
                  that earns a commission is the commission, and on a site
                  about prices it is this site's own price. */}
              <p className="mono mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink-soft">
                <b className="font-semibold text-ink">{COPY.home.heroBylineName}</b>
                <span aria-hidden>·</span>
                <span>{COPY.home.heroBylineNote}</span>
              </p>
            </div>

            {/* THE RECEIPT — the mockup's `.receipt`: the top three printed on
                a till receipt, torn at both ends. See `.receipt` in
                globals.css for how the tear is drawn.

                Rendered only with three to print. A receipt with one line on
                it is a receipt that failed to print; the hero simply going to
                one column reads as a narrow page. */}
            {casinos.length >= 3 && (
              <aside
                className="receipt mx-auto w-full max-w-[440px] px-7 pb-10 pt-[30px]"
                aria-labelledby="top-three-heading"
              >
                <div className="border-b-[1.5px] border-dashed border-ink pb-4 pt-2.5 text-center">
                  <h2 id="top-three-heading" className="font-display text-[30px] text-ink">
                    {COPY.home.podiumBadge}
                    <span className="sr-only"> — {COPY.home.podiumSubtitle}</span>
                  </h2>
                  <p className="lbl mt-1 text-[12.5px] tracking-[0.06em] text-muted">
                    {SITE_NAME} · {COPY.home.podiumTitle}
                  </p>
                </div>

                <ol>
                  {casinos.slice(0, 3).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/casinos/${c.slug}`}
                        className="pick grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 py-3.5"
                      >
                        <b className="pick-name font-display text-[20px] text-ink [overflow-wrap:anywhere]">
                          {c.name}
                        </b>
                        <span className="mono self-center whitespace-nowrap text-[15px] text-ink tabular-nums">
                          <span aria-hidden>★ </span>
                          <span className="sr-only">{COPY.home.podiumRatingLabel} </span>
                          {c.rating.toFixed(1)}
                        </span>
                        {c.bonuses && (
                          <small className="mono col-span-2 text-[13px] text-ink-soft">
                            {c.bonuses}
                          </small>
                        )}
                      </Link>
                    </li>
                  ))}
                </ol>

                {/* The total line. The mockup totals with "FAIR TERMS ✓", a
                    blanket guarantee over a list this site does not
                    underwrite, so the total says where the figures came from
                    instead. */}
                <p className="lbl flex justify-between gap-3 pt-3.5 text-[13px] tracking-[0.04em] text-ink">
                  <span>Items: {Math.min(3, casinos.length)}</span>
                  <span>{COPY.home.receiptSource}</span>
                </p>

                {/* The barcode. `aria-hidden`: it encodes nothing. */}
                <span aria-hidden className="barcode mt-4.5 block h-11 w-full" />
                <p className="lbl mt-2 text-center text-[12px] tracking-[0.1em] text-muted">
                  {COPY.home.receiptFoot}
                </p>
              </aside>
            )}
          </div>
        </section>

        {/* 1 — the rail. Category tabs, then the price tags.
            `id="casinos"` because the hero's primary button points here. */}
        <section id="casinos" className="scroll-mt-28 pt-16 sm:pt-24" aria-labelledby="top-casinos-heading">
          <div className={WRAP}>
            <SectionHead
              id="top-casinos-heading"
              eyebrow={COPY.home.rankingLabel}
              title={COPY.home.topCasinosTitle}
              subtitle={COPY.home.topCasinosSubtitle}
              more={casinos.length > 0 ? { href: '/casinos', label: COPY.home.viewAll, sr: ' casinos' } : undefined}
            />

            {categories.length > 0 && selected && (
              <CategoryNav categories={categories} selected={selected} />
            )}

            {casinos.length === 0 ? (
              /* The mockup's `.empty`: a DASHED ink box in the till face,
                 which is exactly right for a container holding nothing — it
                 reads as a shelf label with no stock behind it rather than as
                 a card that happens to be blank. */
              <p className="mono rounded-2xl border-2 border-dashed border-ink bg-paper p-12 text-center text-[16px] text-ink">
                {COPY.casinos.noResults}
              </p>
            ) : (
              <ol className={CASINO_LIST}>
                {casinos.map((casino, i) => (
                  <CasinoCard key={casino.id} casino={casino} rank={i + 1} />
                ))}
              </ol>
            )}

            {activeCategory && hasMoreCasinos && (
              <div className="mt-12 flex justify-center">
                <Link href={`/categories/${selected}`} className="btn-ln">
                  See more casinos<span className="sr-only"> — {casinosHeading(activeCategory.name)}</span> <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 2 — THE AISLES. Below the rail, which is where the mockup puts
            them and where every other site in this network puts this block,
            so a reader moving between two of them finds it in the same
            place. Nothing at all without a Bonus area. */}
        {bonusSections.length > 0 && (
          <section id="aisles" className="scroll-mt-28 pt-16 sm:pt-24" aria-labelledby="bonus-types-heading">
            <div className={WRAP}>
              <SectionHead
                id="bonus-types-heading"
                eyebrow={COPY.home.bonusTypesKicker}
                title={COPY.home.bonusTypesTitle}
              />
              <BonusCategoryNav sections={bonusSections} />
            </div>
          </section>
        )}

        {/* 3 — the coupons, grouped by aisle. */}
        {bonusSections.length > 0 ? (
          <section id="bonuses" className="scroll-mt-28 pt-16 sm:pt-24" aria-labelledby="bonus-heading">
            <div className={WRAP}>
              <SectionHead
                id="bonus-heading"
                eyebrow={COPY.home.bonusesLabel}
                title={COPY.home.bonus}
                subtitle={COPY.home.bonusesSubtitle}
                more={{ href: '/special-offers', label: COPY.home.seeAllBonuses, sr: '' }}
              />
              <BonusGroups sections={bonusSections} />
            </div>
          </section>
        ) : topOffers.length > 0 && (
          <section id="bonuses" className="scroll-mt-28 pt-16 sm:pt-24" aria-labelledby="offers-heading">
            <div className={WRAP}>
              <SectionHead
                id="offers-heading"
                eyebrow={COPY.home.bonusesLabel}
                title={COPY.specialOffers.pageTitle}
                more={{ href: '/special-offers', label: COPY.home.viewAll, sr: ' bonus coupons' }}
              />
              <div className={OFFER_GRID}>
                {topOffers.map((offer) => (
                  <SpecialOfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4 — HOW A DEAL GETS PRICED. Three white cards on the same 2px ink
            edge and hard offset shadow as everything else, each led by its
            number and a place in a shop: THE LABEL, THE PRICE, THE RETURNS
            DESK.

            Not the mockup's own method, which describes funding an account,
            clearing a bonus and timing a payout. Nothing in this project
            records any of that, and a site whose whole argument is that a
            price should be printed honestly is the last place to print one it
            made up. */}
        <section className="pt-16 sm:pt-24" aria-labelledby="method-heading">
          <div className={WRAP}>
            <SectionHead id="method-heading" eyebrow={COPY.home.methodLabel} title={COPY.home.methodTitle} subtitle={COPY.home.methodSubtitle} />
            <ol className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
              {COPY.home.methodSteps.map((step) => (
                <li key={step.no} className="step px-6 py-7 sm:px-7">
                  <p className="lbl flex items-center gap-2.5 text-[13px] text-brand">
                    <span className="tabular-nums">{step.no}</span>
                    <span aria-hidden className="h-[2px] w-4 bg-brand" />
                    <span>{step.verb}</span>
                  </p>
                  <h3 className="font-display mb-3 mt-3.5 text-[24px] text-ink">{step.title}</h3>
                  <p className="text-[15.5px] leading-[1.65] text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>

            {/* The disclosure again, and here it is the fourth read in all but
                name: the three above say what gets read, and this says who
                pays for the reading. On the YELLOW — the loudest ground on
                the site, spent on the one line in the section a reader might
                otherwise skim past. Ink on it is 12.92:1. */}
            <p className="deep-panel mt-6 flex items-start gap-4 px-6 py-5 text-[16px] font-bold">
              {/* The tag again, small — the brand's own mark rather than a
                  stray dingbat, which is what was here and rendered as a
                  squiggle in half the font stacks that might be asked for
                  it. */}
              <svg aria-hidden viewBox="0 0 48 48" className="mt-0.5 h-[22px] w-[22px] shrink-0">
                <path d="M14 4h20l10 10v30H4V14z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
                <circle cx="24" cy="13.5" r="3" fill="currentColor" />
              </svg>
              <span>{COPY.home.methodLoop}</span>
            </p>
          </div>
        </section>

        {/* 5 — CUSTOMER SERVICE. Every answer is in the HTML, open or closed,
            which the FAQPage schema requires. NARROWER than every other
            section — the mockup's own `.narrow`. */}
        <section className="pt-16 sm:pt-24" aria-labelledby="faq-heading">
          <div className={WRAP_NARROW}>
            <SectionHead id="faq-heading" eyebrow={COPY.home.faqLabel} title={COPY.home.faqTitle} subtitle={COPY.home.faqSubtitle} />
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </section>
      </main>
    </>
  )
}

/**
 * The mockup's `.sec-head`: a KICKER in the red till face, the heading under
 * it with its LAST WORD in red, a standfirst beneath that, an optional link
 * to the full list at the right margin — and the whole block closed by a 2px
 * INK RULE.
 *
 * THE RULE IS THE STRUCTURE here, which is the opposite of the sibling this
 * site was cloned from, where a section is announced by its heading alone. A
 * shop is organised by signs over aisles, and a sign has a line under it.
 * It is also the only thing holding eight sections of cut white shapes on one
 * flat paper ground together.
 *
 * `flex-[1_1_28rem]` on the text block and `flex-none` on the link, and both
 * are load-bearing. `flex-wrap` breaks lines on each item's HYPOTHETICAL size
 * — its flex-basis, which for an unconstrained block is its max-content width
 * — not on its min-content width. A 76px condensed heading's max-content
 * width runs to well over 1000px, so with `auto` basis the pair wrapped at
 * every viewport and the "View all" link landed on its own line at the LEFT
 * margin, under the standfirst. A 28rem basis is what lets the two share a
 * row until they genuinely cannot.
 *
 * The kicker is `aria-hidden`. It is a second, shorter name for the same
 * section — "On the rail" over "The Rail, Priced Up" — and announcing both
 * would read the heading twice.
 *
 * A local component rather than one in components/: every site in the network
 * heads its sections differently, and this shape is this design's own.
 */
function SectionHead({
  id,
  eyebrow,
  title,
  subtitle,
  more,
}: {
  id: string
  eyebrow?: string
  title: string
  subtitle?: string
  more?: { href: string; label: string; sr: string }
}) {
  const [head, tail] = lastWord(title)
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-5 gap-y-3 border-b-2 border-ink pb-[18px]">
      <div className="min-w-0 flex-[1_1_28rem]">
        {eyebrow && (
          <span aria-hidden className="lbl mb-3 block text-[13px] text-brand">
            {eyebrow}
          </span>
        )}
        <h2 id={id} className="font-display text-[clamp(38px,5.6vw,76px)] text-ink">
          {head}
          {tail && <em className="hl not-italic">{tail}</em>}
        </h2>
        {subtitle && <p className="mt-3 max-w-[640px] text-[17px] text-ink-soft">{subtitle}</p>}
      </div>
      {more && (
        <Link
          href={more.href}
          className="inline-flex min-h-11 flex-none items-center gap-1.5 text-[15px] font-bold text-sea underline-offset-4 transition-colors hover:text-brand hover:underline"
        >
          {more.label}{more.sr && <span className="sr-only">{more.sr}</span>} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  )
}
