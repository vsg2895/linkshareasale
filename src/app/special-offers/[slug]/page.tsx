import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Stars } from '@/components/CasinoCard'
import { notFound } from 'next/navigation'
import { getSpecialOffer, getBonusCategory } from '@/lib/api'
import { buildBreadcrumbSchema, buildWebPageSchema, breadcrumbIdFor, jsonLdScript, SHARE_IMAGES } from '@/lib/seo'
import { resolveImageUrl } from '@/lib/images'
import { COPY } from '@/constants/copy'
import { SITE_URL } from '@/lib/config'
import BonusTerms from '@/components/BonusTerms'
import { CLAIMABLE_BONUS_CATEGORY, OfferRow } from '@/components/SpecialOfferCard'
import { WRAP } from '@/constants/layout'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? ''

/**
 * What the banner is drawn at: the page's 94rem column (1440px of artwork)
 * from 1504px up, the viewport minus the 16 / 24 / 32px gutters below it — the
 * same frame winpalack uses.
 */
const BANNER_SIZES =
  '(min-width: 1504px) 1440px, (min-width: 1024px) calc(100vw - 4rem), (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)'

type Props = { params: Promise<{ slug: string }> }

/*
 * NO generateStaticParams, deliberately — this route renders on demand.
 *
 * Next classifies a dynamic route from what that function RETURNS: a non-empty
 * list builds `f` (dynamic), an EMPTY list builds a fully static route. A
 * static render then throws DYNAMIC_SERVER_USAGE, because the root layout
 * reads the session cookie for the header's account control and a static
 * render may not touch cookies — taking the whole route down with a 500 for
 * every slug, valid or not.
 *
 * Not hypothetical: that is exactly how /special-offers/[slug] broke on the
 * one site with no visible offers. It was reachable here too, because the
 * params lookup failed CLOSED to an empty list, so one API blip was enough to
 * change the build shape.
 *
 * Removing the function pins the route dynamic whatever the data does.
 * `force-dynamic` is deliberately NOT used: it would also downgrade fetchCache
 * to no-store and send every request to the API, where this leaves the
 * existing per-fetch cache and its tags exactly as they were.
 */

/**
 * The offer's own prose, as plain text — the field an editor actually writes.
 *
 * Measured on the live data before this existed: 18 of 29 offers carry no
 * `bonuses` value, and `bonuses` is a column on the GLOBAL `special_offers`
 * row — identical across every domain in the network, with only 8 distinct
 * values across 29 offers. Composed from it, every thin offer's meta
 * description came out as its title plus one sentence repeated on every sibling
 * page. `description` is the only one of the three that is unique per offer.
 */
function plainDescription(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Trimmed at a word boundary to the ~155 characters Google renders. */
function metaLength(text: string): string {
  return text.length <= 155 ? text : `${text.slice(0, 155).replace(/\s+\S*$/, '')}…`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { data: offer } = await getSpecialOffer(slug)
    // This site's meta title / description, when the admin or the SEO seeder
    // set one (the API already resolves the site's own override over the
    // offer's default); otherwise the composed fallbacks below.
    const title = offer.meta_title?.trim() || offer.title
    /*
     * The written description first; the `bonuses` composition only as a
     * fallback for an offer nobody has written up yet — a content gap this file
     * cannot close, not something to paper over with longer boilerplate.
     */
    const prose = plainDescription(offer.description)
    const metaDescription = offer.meta_description?.trim() ?? ''
    const description = metaDescription !== ''
      ? metaLength(metaDescription)
      : prose !== ''
        ? metaLength(prose)
        : offer.bonuses
          ? `${offer.bonuses} — ${COPY.specialOffers.offerMetaSuffix}`
          : `${offer.title} — ${COPY.specialOffers.offerMetaSuffix}`
    return {
      title,
      description,
      alternates: { canonical: `/special-offers/${slug}` },
      openGraph: { type: 'article', url: `/special-offers/${slug}`, siteName: SITE_NAME, title, description, images: SHARE_IMAGES },
      // A hidden offer stays reachable by direct link so it can be reviewed,
      // but it must never enter the index. It is already absent from every
      // listing and from the sitemap; this stops a crawler that finds the URL
      // some other way (a shared link, a referrer) from indexing it.
      /*
       * TWO distinct gates.
       *
       * `!active` is the hard one: the offer is withdrawn, the page exists only
       * so an old link does not 404, and `follow: false` keeps it from passing
       * anything onward.
       *
       * `is_indexable` is the editorial one (SpecialOffer::isIndexable): true
       * unless an admin set noindex on this offer. Every other offer page is
       * indexed. `follow` stays true on a noindexed one: its casino and
       * category links are still worth following.
       *
       * The same flag filters the sitemap, so the two can never disagree.
       */
      ...(!offer.active
        ? { robots: { index: false, follow: false } }
        : offer.is_indexable === false
          ? { robots: { index: false, follow: true } }
          : {}),
    }
  } catch {
    return { title: COPY.errors.notFound }
  }
}

export default async function SpecialOfferDetailPage({ params }: Props) {
  const { slug } = await params

  let offer
  try {
    offer = (await getSpecialOffer(slug)).data
  } catch {
    notFound()
  }

  const banner = resolveImageUrl(offer.banner_image ?? offer.image_path)
  // The same rule the cards use: Claim is a property of the bonus TYPE.
  const claimable = offer.bonus_category_slug === CLAIMABLE_BONUS_CATEGORY
  const pageUrl = `${SITE_URL}/special-offers/${slug}`
  const breadcrumb = buildBreadcrumbSchema(
    [
      { name: 'Home', url: SITE_URL },
      { name: 'Special Offers', url: `${SITE_URL}/special-offers` },
      { name: offer.title, url: pageUrl },
    ],
    pageUrl,
  )
  /*
   * `Offer`, and deliberately NOT `SpecialAnnouncement`.
   *
   * SpecialAnnouncement is scoped to public-health and emergency notices;
   * applying it to a casino bonus is schema misuse that risks a manual action
   * rather than a rich result. `Offer` is the type that describes a promotion.
   *
   * ONLY FIELDS WE ACTUALLY HOLD. No `price`, no `priceCurrency`, no
   * `availabilityEnds` — this API exposes none of them, and an Offer carrying an
   * invented figure is worse than no Offer at all. `bonuses` gets no property of
   * its own either: it reads like "100% up to €500", and the Offer properties
   * that take a figure expect a number or a PriceSpecification, not a sentence.
   */
  const offerProse = plainDescription(offer.description)
  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.title,
    url: pageUrl,
    ...(offerProse !== ''
      ? { description: offerProse }
      : offer.bonuses
        ? { description: offer.bonuses }
        : {}),
    ...(offer.casino?.name
      ? { offeredBy: { '@type': 'Organization', name: offer.casino.name } }
      : {}),
    ...(offer.bonus_category_name ? { category: offer.bonus_category_name } : {}),
  }

  const graph = [
    buildWebPageSchema({
      name: offer.title,
      url: pageUrl,
      // The prose, not the shared `bonuses` line that is identical network-wide.
      description: offerProse !== '' ? offerProse : (offer.bonuses ?? undefined),
      breadcrumbId: breadcrumbIdFor(pageUrl),
      dateModified: offer.updated_at,
    }),
    breadcrumb,
    offerSchema,
  ]

  // Claim, as everywhere on this site: the Special Offers type, with a link, and
  // never on an expired offer.
  const showClaim = !offer.terms?.expired && claimable && !!offer.affiliate_url
  const kicker = [offer.bonus_category_name, offer.casino?.name].filter(Boolean).join(' · ')

  // "More <type>": other offers of the same bonus type, from the same cached
  // endpoint /bonuses/<slug> renders. A failure only drops the section.
  const moreOffers = offer.bonus_category_slug
    ? ((await getBonusCategory(offer.bonus_category_slug))?.offers ?? []).filter((o) => o.id !== offer.id).slice(0, 3)
    : []

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />

      <main className="pb-4">
        <div className={WRAP}>
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 pt-[22px] text-[13px] text-muted">
            <Link href="/" className="-mx-1 -my-3 inline-block px-1 py-3 transition-colors hover:text-brand-dark">Home</Link>/
            <Link href="/special-offers" className="-mx-1 -my-3 inline-block px-1 py-3 transition-colors hover:text-brand-dark">{COPY.nav.specialOffers}</Link>/
            <span className="font-semibold text-ink">{offer.title}</span>
          </nav>

          {/* THE BANNER — the artwork whole in a 16:6 frame on an ink ground
              with a 2px ink edge, with the barcode showing in the letterbox
              `object-contain` leaves. See the same block on the casino page
              for why the mockup's giant "SALE" is not there. */}
          {banner && (
            <div className="relative mt-6 aspect-[16/6] overflow-hidden rounded-2xl border-2 border-ink bg-navy">
              <span aria-hidden className="barcode absolute inset-x-8 bottom-6 h-10 opacity-25" />
              <Image src={banner} alt={offer.title} fill className="relative object-contain object-center" sizes={BANNER_SIZES} preload fetchPriority="high" />
            </div>
          )}

          {/* The offer's card — the mockup's `.side`: type and casino, the
              title, the rating and who offers it, the amount, then Claim (or
              the expired notice) and the way to the casino's review. */}
          <header className="mt-6 grid gap-7 rounded-2xl border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-ink)] sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-center lg:gap-10">
            <div className="flex min-w-0 flex-col gap-3">
              {kicker && <p className="lbl text-[13px] text-brand">{kicker}</p>}
              <h1 className="font-display text-[clamp(30px,4.8vw,54px)] text-ink [overflow-wrap:anywhere]">
                {offer.title}
              </h1>
              {/* THE RATING, only when there IS one — an offer whose rating
                  has never been set comes back as 0, and five empty stars
                  beside "0.0" reads as rated zero rather than unrated. The
                  clone printed it unconditionally here while its own card
                  gated it, so the same offer said two different things on two
                  pages. */}
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[14px] font-bold text-ink">
                {offer.rating > 0 && (
                  <>
                    <Stars rating={offer.rating} />
                    <span className="mono tabular-nums">{offer.rating.toFixed(1)}/5</span>
                  </>
                )}
                {offer.casino && (
                  <>
                    {offer.rating > 0 && <span aria-hidden>·</span>}
                    <span className="font-medium text-ink-soft">
                      Offer by{' '}
                      <Link href={`/casinos/${offer.casino.slug}`} className="inline-flex min-h-11 items-center font-bold text-brand underline-offset-2 hover:underline">
                        {offer.casino.name}
                      </Link>
                    </span>
                  </>
                )}
              </p>
              {offer.bonuses && (
                <p className="deep-panel font-display cond-78 mt-1 px-5 py-4 text-[clamp(21px,2.6vw,29px)] leading-[1.1] text-ink [overflow-wrap:anywhere]">
                  {offer.bonuses}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {/* An EXPIRED offer keeps its page — the URL stays valid and the
                  terms stay readable — but it is never presented as claimable:
                  the CTA becomes a plain statement, so a visitor who followed an
                  old link understands why there is nothing to press. */}
              {offer.terms?.expired ? (
                <p className="rounded-xl border-2 border-ink bg-surface px-5 py-4 text-sm font-semibold text-ink-soft">
                  This offer ended
                  {offer.terms.expires_at ? (
                    <> on <time dateTime={offer.terms.expires_at}>{offer.terms.expires_at}</time></>
                  ) : null}
                  . It is no longer available to claim.{' '}
                  <Link href="/special-offers" className="font-bold text-brand underline underline-offset-2 hover:text-ink">
                    See current offers
                  </Link>
                </p>
              ) : (
                showClaim && (
                  <a
                    href={offer.affiliate_url!}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="btn-or w-full"
                  >
                    {COPY.specialOffers.claim}
                  </a>
                )
              )}
              {offer.casino && (
                <Link href={`/casinos/${offer.casino.slug}`} className="btn-ln w-full">
                  Read the full review <span aria-hidden>→</span>
                </Link>
              )}
              <p className="mono text-[12px] text-muted">
                18+. T&amp;Cs apply — read the full conditions on the operator&apos;s own site before
                depositing.{' '}
                <Link href="/responsible-gambling" className="font-bold text-brand underline underline-offset-2 hover:text-ink">
                  Play responsibly
                </Link>
                .
              </p>
            </div>
          </header>

          {offer.terms && <BonusTerms terms={offer.terms} />}

          {offer.description && (
            <section className="mt-11" aria-labelledby="about-offer">
              <h2 id="about-offer" className="font-display mb-5 text-[clamp(28px,3.4vw,44px)] text-ink">
                About this offer
              </h2>
              <div
                className="prose max-w-none rounded-2xl border-2 border-ink bg-paper px-6 py-7 prose-p:max-w-[72ch] prose-p:text-[17px] prose-p:leading-[1.8] sm:px-9 sm:py-9"
                dangerouslySetInnerHTML={{ __html: offer.description }}
              />
            </section>
          )}

          {/* How to claim — only where there IS something to claim. */}
          {showClaim && (
            <section className="mt-8" aria-labelledby="how-to-claim">
              <h2 id="how-to-claim" className="font-display mb-5 text-[clamp(28px,3.4vw,44px)] text-ink">
                How to claim
              </h2>
              <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="list">
                {[
                  `Open ${offer.casino?.name ?? 'the casino'} with the button on this page.`,
                  'Finish registration and verify your account.',
                  'Read the operator’s terms, then opt in where the offer asks you to.',
                ].map((step, i) => (
                  <li key={step} className="step p-6 text-ink-soft">
                    <b aria-hidden className="lbl mb-2.5 block text-[12.5px] text-brand">STEP {String(i + 1).padStart(2, '0')}</b>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {moreOffers.length > 0 && offer.bonus_category_slug && (
            <section className="mt-14" aria-labelledby="more-offers">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="more-offers" className="font-display text-[clamp(28px,3.4vw,44px)] text-ink">
                  More {offer.bonus_category_name ?? 'offers'}
                </h2>
                <Link href={`/bonuses/${offer.bonus_category_slug}`} className="inline-flex min-h-11 items-center font-bold text-sea underline-offset-4 transition-colors hover:text-brand hover:underline">
                  View all <span aria-hidden className="ml-1">→</span>
                </Link>
              </div>
              <ul className="mt-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper" role="list">
                {moreOffers.map((o) => <OfferRow key={o.id} offer={o} heading="h3" />)}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
