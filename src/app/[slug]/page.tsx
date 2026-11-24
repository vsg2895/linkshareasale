import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/api'
import { LEGAL_PAGES } from '@/constants/legalPages'
import { buildBreadcrumbSchema, buildWebPageSchema, breadcrumbIdFor, jsonLdScript, SHARE_IMAGES } from '@/lib/seo'
import { SITE_URL } from '@/lib/config'
import { WRAP_NARROW } from '@/constants/layout'

// The known legal slugs are pre-rendered; any OTHER published CMS page renders
// on demand (and unknown/unpublished slugs 404 via notFound()). Static segments
// (casinos, categories, special-offers) take priority over this dynamic one.
export const dynamicParams = true

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? ''

type Props = { params: Promise<{ slug: string }> }

// The two standard pages that have a schema.org type of their own. Every other
// CMS page — legal or bespoke — stays a plain WebPage.
const PAGE_TYPES: Record<string, 'AboutPage' | 'ContactPage'> = {
  about: 'AboutPage',
  contact: 'ContactPage',
}

export function generateStaticParams(): Array<{ slug: string }> {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Page not found' }

  // `meta_title` is authored in the admin as a COMPLETE title and normally
  // already carries the brand ("Responsible Gambling — Viglinksi"). The root
  // layout's `title.template` would then append it a SECOND time, which is how
  // these pages ended up as "… — Brand | Brand".
  //
  // So compose the final value here and mark it `absolute` to opt out of the
  // template — appending the brand only when the authored title genuinely lacks
  // it, so an admin can write the title either way and still get exactly one.
  const headline = page.meta_title ?? page.title
  const title = headline.includes(SITE_NAME) ? headline : `${headline} | ${SITE_NAME}`

  return {
    title: { absolute: title },
    description: page.meta_description ?? undefined,
    alternates: { canonical: `/${slug}` },
    openGraph: { type: 'article', url: `/${slug}`, siteName: SITE_NAME, title: headline, description: page.meta_description ?? undefined, images: SHARE_IMAGES },
    /*
     * FROM THE API, not from a list in this file.
     *
     * This used to be `LEGAL_PAGES.some(…)`, which suppressed all ELEVEN
     * standard pages. Six of them deserve it — privacy policy, terms, cookie
     * policy, disclaimer, AML and KYC are generated from one template for every
     * site in the network, so indexing them would put eight near-identical
     * copies into the index competing with each other.
     *
     * The other five do not. /about, /contact, /responsible-gambling,
     * /affiliate-disclosure and /editorial-policy are the pages Google's
     * quality guidance looks for on a gambling affiliate — who runs this site,
     * how it is funded, how operators are assessed — and Search Console was
     * reporting them as "Excluded by noindex". Suppressing them hid the trust
     * signals the whole domain is judged on.
     *
     * So the decision lives in `cms_pages.noindex`, per page and per site: the
     * six legal pages ship true, the five trust pages ship false, and an editor
     * can flip either without a deploy. `follow` stays TRUE on a noindexed
     * page, so it still passes authority through its internal links.
     *
     * A page the API does not flag indexes normally — bespoke editorial for
     * this site is exactly what should be in the index.
     */
    robots: page.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  const label = LEGAL_PAGES.find((p) => p.slug === slug)?.label ?? page.title
  // UTC, so the build server's zone cannot move the date a day either way.
  const updated = page.updated_at
    ? new Date(page.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : null
  const pageUrl = `${SITE_URL}/${slug}`
  const breadcrumb = buildBreadcrumbSchema(
    [
      { name: 'Home', url: SITE_URL },
      { name: label, url: pageUrl },
    ],
    pageUrl,
  )
  const graph = [
    buildWebPageSchema({
      name: page.title,
      url: pageUrl,
      description: page.meta_description ?? undefined,
      breadcrumbId: breadcrumbIdFor(pageUrl),
      dateModified: page.updated_at,
      type: PAGE_TYPES[slug] ?? 'WebPage',
    }),
    breadcrumb,
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />

      <main className="pb-20 pt-8">
        <div className={WRAP_NARROW}>
          {/* The breadcrumb, as a REAL 44px row rather than the `py-3 -my-3`
              idiom this was cloned with: padding to inflate a hit box and a
              negative margin to cancel the layout makes a box TALLER than the
              pitch between neighbours, so the later sibling paints over it
              and the target collapses back to the pitch. See sites/CLAUDE.md. */}
          <nav className="mono mb-5 flex flex-wrap items-center gap-x-2 text-[13.5px] text-muted">
            <Link href="/" className="inline-flex min-h-11 min-w-11 items-center transition-colors hover:text-brand">Home</Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-ink">{page.title}</span>
          </nav>

          <h1 className="font-display text-[clamp(34px,9vw,42px)] text-ink [overflow-wrap:break-word] sm:text-[clamp(44px,5.6vw,72px)]">{page.title}</h1>
          {/* The date a policy last changed is part of the policy: "review it
              periodically" means nothing without one. The same value is the
              WebPage's dateModified above, so the page and its markup agree. */}
          {updated && (
            <p className="mt-3 text-sm text-faint">
              Last updated <time dateTime={page.updated_at}>{updated}</time>
            </p>
          )}

          {/* THE CARD. The prose HAS to be on a white ground: every `.prose`
              colour in globals.css is a CARD colour, and the paper this page
              stands on is a different stock from the one a document is
              printed on. The clone put this article straight on the page. */}
          <article
            className="prose mt-8 max-w-none rounded-2xl border-2 border-ink bg-paper px-6 py-8 shadow-[6px_6px_0_var(--color-ink)] prose-a:text-brand sm:px-10 sm:py-10"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </main>
    </>
  )
}
