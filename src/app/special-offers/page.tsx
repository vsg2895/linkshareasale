import type { Metadata } from 'next'
import { getSpecialOffers } from '@/lib/api'
import { buildWebPageSchema, jsonLdScript, SHARE_IMAGES } from '@/lib/seo'
import { COPY } from '@/constants/copy'
import SpecialOfferCard, { OFFER_GRID } from '@/components/SpecialOfferCard'
import { SITE_URL } from '@/lib/config'
import { WRAP } from '@/constants/layout'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? ''

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: COPY.specialOffers.pageTitle,
    description: COPY.specialOffers.pageDescription,
    alternates: { canonical: `/special-offers` },
    openGraph: { type: 'website', url: `/special-offers`, siteName: SITE_NAME, title: COPY.specialOffers.pageTitle, description: COPY.specialOffers.pageDescription, images: SHARE_IMAGES },
  }
}

export default async function SpecialOffersPage() {
  const res = await getSpecialOffers()
  const offers = res.data

  // These listing pages carried no structured data at all. A WebPage node
  // anchors them into the site graph so they are not read as orphans.
  const webPage = buildWebPageSchema({
    name: COPY.specialOffers.pageTitle,
    url: `${SITE_URL}/special-offers`,
    description: COPY.specialOffers.pageDescription,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(webPage) }} />
      <main className="pb-12 pt-6 sm:pb-16 sm:pt-10">
      <div className={WRAP}>
        <header className="mb-4 sm:mb-8">
          <h1 className="font-display text-[clamp(34px,9vw,42px)] text-ink [overflow-wrap:break-word] sm:text-[clamp(44px,5.6vw,72px)]">{COPY.specialOffers.pageTitle}</h1>
          <p className="mt-3 max-w-[680px] text-[15px] text-ink-soft sm:mt-4 sm:text-[17px]">{COPY.specialOffers.pageDescription}</p>
        </header>
        {offers.length === 0 ? (
          <p className="mono rounded-2xl border-2 border-dashed border-ink bg-paper p-12 text-center text-[16px] text-ink">{COPY.specialOffers.noResults}</p>
        ) : (
          <div className={OFFER_GRID}>
            {offers.map((offer) => <SpecialOfferCard key={offer.id} offer={offer} />)}
          </div>
        )}
      </div>
      </main>
    </>
  )
}
