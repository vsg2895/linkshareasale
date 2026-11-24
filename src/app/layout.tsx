import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import Link from 'next/link'
import ScrollToTopOnNavigate from '@/components/ScrollToTopOnNavigate'
import NewsletterForm from '@/components/NewsletterForm'
import SocialIcons from '@/components/SocialIcons'
import CookieConsent from '@/components/CookieConsent'
import ToastProvider from '@/components/ToastProvider'
import CookieSettingsButton from '@/components/CookieSettingsButton'
import Logo from '@/components/Logo'
import { getSocialLinks, hasSpecialOffers, getCategories, getBonusArea } from '@/lib/api'
import { buildOrganizationSchema, buildWebSiteSchema, jsonLdScript, SHARE_IMAGES } from '@/lib/seo'
import { SITE_URL } from '@/lib/config'
import { COPY } from '@/constants/copy'
import { WRAP } from '@/constants/layout'
import NavDropdown from '@/components/NavDropdown'
import FooterNavGroup from '@/components/FooterNavGroup'
import MobileNav from '@/components/MobileNav'
import { resolveImageUrl } from '@/lib/images'
import { LEGAL_PAGES } from '@/constants/legalPages'
import type { SocialLink } from '@shared/types/socialLink'
import './globals.css'

// The TWO faces of sites/linkshareasale.html.
//
// ARCHIVO IS LOADED WITH ITS WIDTH AXIS, and that is not optional — it is the
// single most load-bearing line in this file. Every heading, every price and
// every sale-sign capital on this site is set at `font-stretch: 72%` (65% on a
// coupon stub, 78% on a price), and `font-stretch` DOES NOTHING unless the
// variable font actually carries `wdth`. Without `axes: ['wdth']` the browser
// silently renders the normal width, no error appears anywhere, and the whole
// design degrades into a generic grotesque. netbetus hit exactly this.
//
// IBM PLEX MONO carries everything a till would have printed: the kickers, the
// receipt, the ticket numbers on the FAQ, the facts under a tag, the counts,
// the footer column heads. It is NOT the display face, which is the opposite
// of most of this network — a condensed 900 capital at 13px is a blob, and a
// monospace at 13px is a label.
const archivo = Archivo({ variable: '--font-archivo', subsets: ['latin'], axes: ['wdth'] })
const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

/**
 * Subscribe capture: every entry point on this site — the newsletter form and,
 * where the site has one, the timed subscribe modal.
 *
 * The components, the /api/newsletter route and the backend double-opt-in flow
 * are never touched by this; it only decides whether they are rendered. That is
 * the point of a flag rather than deleted markup: turning capture off and back
 * on is one edit, and nothing has to be rebuilt from memory.
 */
const SUBSCRIBE_ENABLED = true

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Link Share a Sale'

// Both strings live in COPY so this site's wording is defined in exactly one
// place — the same place the page-level titles and descriptions come from.
// The previous SITE_DESCRIPTION here was byte-identical to a sibling domain's,
// which made this site's default meta/og/twitter description duplicate content
// on every page that falls back to it.
const SITE_TITLE = `${SITE_NAME} — ${COPY.site.titleTail}`
const SITE_DESCRIPTION = `${SITE_NAME} ${COPY.site.description}`

export const metadata: Metadata = {
  // THE origin every relative canonical and og:url in the app resolves
  // against. `SITE_URL` is validated at module load (see lib/config), so the
  // old `|| 'https://…'` literal is gone: a second hardcoded host here is
  // exactly how the canonical and the sitemap drifted onto different hosts.
  metadataBase: new URL(SITE_URL),
  // Root default. Every page overrides it with its own path, so each URL
  // gets a SELF-referencing canonical rather than inheriting the homepage's.
  alternates: { canonical: '/' },
  title: {
    // Home & inner pages set their own; this is the SEO-friendly fallback title.
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Terms that describe what THIS site publishes. The generic set that was
  // here was shared with a sibling domain and described neither in particular.
  keywords: [...COPY.site.keywords, SITE_NAME],
  // Tab icon.
  //
  // This used to offer ONLY icon.svg. Browsers that do not take an SVG favicon
  // — Safari most visibly — then had nothing to fall back to, because
  // /favicon.ico 404'd, so they showed a placeholder or a stale cached icon
  // instead of this site's own mark. app/favicon.ico now holds 16/32/48 rasters
  // cut from that same artwork, and Next links it automatically from the file
  // convention, so it is deliberately NOT repeated here.
  //
  // `apple` DOES have to be listed: an explicit icons object suppresses the
  // apple-icon file convention, so app/apple-icon.tsx was generating a 180x180
  // PNG at /apple-icon that no page ever linked to.
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // Relative on purpose: Next resolves it against metadataBase, so og:url
    // and the canonical can never disagree about the host.
    url: '/',
    images: SHARE_IMAGES,
  },
  // The card TYPE only. A title and description here were inherited by every
  // page that does not set `twitter` itself — nearly all of them — so a shared
  // /casinos or /about went out on X under the HOME page's title. With these
  // tags absent, X reads the page's own og:title, og:description and og:image.
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Search-engine ownership verification, supplied per environment. Absent env
  // vars simply produce no tag, so nothing has to be committed to the repo.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION
        ? { 'p:domain_verify': process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION }
        : {}),
    },
  },
}

/**
 * Viewport + theme colour.
 *
 * Next 14 moved these out of `metadata` into their own export; leaving
 * themeColor in `metadata` is silently ignored, which is why the sites had no
 * theme-color at all. `viewport-fit=cover` is deliberately omitted — nothing
 * here draws into the notch area.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4f1ea',
}

const NAV_LINKS = [
  { href: '/casinos', label: COPY.nav.casinos },
  { href: '/special-offers', label: COPY.nav.specialOffers },
  { href: '/categories', label: COPY.nav.categories },
]

/** A nav link — the mockup's `.hdr .nav a`: sentence case, semibold, 15px,
 *  no fill, no box, no rule. It only changes colour on hover.
 *
 *  It is NOT `.lbl` and it is NOT the condensed display face. The monospace
 *  marks things that are not links — kickers, counts, the facts under a tag —
 *  and the condensed 900 is for headings and prices. Four nav entries in
 *  either treatment would make the one row a reader actually navigates with
 *  look like the least clickable thing on the page.
 *
 *  The hover is a YELLOW FILL rather than a colour change, which is the
 *  mockup's own and is what this site does everywhere: a thing being pointed
 *  at goes yellow. Ink on the yellow is 12.92:1. */
const NAV_LINK = 'flex min-h-11 items-center whitespace-nowrap rounded-lg px-4 py-2 text-[15px] font-bold text-ink transition-colors hover:bg-accent'

const FOOTER_LINK = 'inline-flex min-h-11 min-w-11 items-center text-[15px] font-medium text-night-muted transition-colors hover:text-night-accent'

/** A footer column head — the mockup's `.ftr h4`: 12.5px of the monospace
 *  on 0.1em, in YELLOW, with no rule under it. `.lbl`, because on this site
 *  a small tracked label is always the till face. The yellow is 12.92:1 on
 *  the ink. */
const FOOTER_HEAD = 'lbl block text-[12.5px] tracking-[0.1em] text-night-accent'

// The 11 legal pages split into the footer's three columns, as in the mockup.
// Every page in LEGAL_PAGES lands in exactly one of them.
const FOOTER_EXPLORE = ['about', 'contact']
const FOOTER_LEGAL = ['privacy-policy', 'terms', 'cookie-policy', 'disclaimer']
const FOOTER_POLICIES = ['responsible-gambling', 'affiliate-disclosure', 'editorial-policy', 'aml-policy', 'kyc-policy']

function footerPages(slugs: string[]) {
  return LEGAL_PAGES.filter(({ slug }) => slugs.includes(slug))
}

/** The header dropdown panel, in this site's own palette.
 *
 *  `NavDropdown` is byte-identical on every site in the network and takes its
 *  whole appearance from these four strings. Here it is a white card on the
 *  same 2px ink edge and the same hard offset shadow every other object on
 *  the site carries — a panel is a thing you can press, so it is built like
 *  one. A hovered row goes YELLOW, which is what everything pointed at does.
 */
const NAV_PANEL = {
  panelClassName: 'bg-paper border-2 border-ink rounded-2xl shadow-[4px_4px_0_var(--color-ink)]',
  itemClassName: 'text-ink-soft hover:bg-accent hover:text-ink',
  allItemClassName: 'text-ink hover:bg-accent hover:text-ink',
  arrowClassName: 'text-brand',
}

/** The phone menu (below `md`), in this site's own palette — the mockup's
 *  `.burger` and `.mnav`: a 46px button on a 10px corner with a 2px ink edge,
 *  over rows parted by hairlines.
 *
 *  The trigger is the one control in the header bar at phone width, so it
 *  carries the full 2px ink border and goes yellow when pressed, exactly like
 *  every button on the site. */
const NAV_MOBILE = {
  triggerClassName: 'rounded-[10px] border-2 border-ink bg-paper text-ink hover:bg-accent',
  panelClassName: 'bg-cream border-ink border-t-2',
  rowClassName: 'text-ink hover:bg-accent hover:text-ink',
  rowExpandedClassName: 'bg-accent text-ink',
  allClassName: 'text-ink hover:bg-accent hover:text-ink',
  childClassName: 'text-ink-soft hover:bg-accent hover:text-ink',
  guideClassName: 'border-line',
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  /*
   * Widened to `string` deliberately.
   *
   * COPY is `as const`, so this would otherwise carry the LITERAL type of
   * whatever address is written in copy.ts — and TypeScript then rejects
   * `!== ''` as a comparison that can never be true. The check is not
   * pointless: a freshly cloned site ships with this blank, and the footer has
   * to omit the whole <address> element rather than print an empty one.
   */
  const postalAddress: string = COPY.footer.postalAddress

  let socialLinks: SocialLink[] = []
  try {
    socialLinks = (await getSocialLinks()).data
  } catch {
    socialLinks = []
  }

  // "Special Offers" only earns its slot in the nav when this site actually has
  // a visible offer to show; with none, the link would lead to an empty page,
  // so both the header and the footer drop it.
  const showSpecialOffers = await hasSpecialOffers()
  const navLinks = NAV_LINKS.filter(({ href }) => href !== '/special-offers' || showSpecialOffers)

  // Children for the Casinos and Bonuses entries, header and footer
  // alike. Each carries the icon its chip shows, resolved here on the server so
  // the client menus never need the storage URL. A failed fetch yields no
  // items, and the entry then stays the plain link it always was.
  const categoryMenuItems = await getCategories()
    .then((res) => res.data.map((c) => ({ slug: c.slug, name: c.name, icon: resolveImageUrl(c.logo_path) })))
    .catch(() => [])
  // Bonus types with at least one visible offer on this site (the API drops
  // empty ones). getBonusArea already falls back to [] on failure.
  const bonusMenuItems = (await getBonusArea()).map((section) => ({
    slug: section.slug,
    name: section.name,
    icon: resolveImageUrl(section.icon_path),
  }))

  // Site-wide structured data, rendered once here so every page carries it.
  // Next.js manages the document <head> (manual <head> tags in a root layout are
  // discouraged), so per the framework's JSON-LD guide the <script> is rendered
  // in the layout body — crawlers read JSON-LD from anywhere in the document.
  // The `<` escaping keeps the payload XSS-safe.
  //
  // Two nodes, cross-referenced by @id: the publisher (Organization) and the
  // site (WebSite). socialLinks is already fetched above for the footer, so
  // `sameAs` costs no extra request.
  const siteGraph = [buildOrganizationSchema(socialLinks), buildWebSiteSchema()]

  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {/* Opens every page at its top — see the component. */}
        <ScrollToTopOnNavigate />
        <ToastProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(siteGraph),
          }}
        />
        {/* THE TICKER — the mockup's `.top`: a strip of ink above everything,
            carrying one sentence about the method and the 18+ line, set in
            the till face.

            It is NOT sticky and comes before the header on purpose: it is
            read once. Its left-hand sentence is the first thing to go when
            the row narrows — the 18+ line is the one of the two that has to
            survive a phone. */}
        <div className="bg-navy text-night-muted">
          <div className={`${WRAP} mono flex min-h-10 flex-wrap items-center justify-between gap-4 py-1.5 text-[13.5px]`}>
            <p className="hidden min-[64rem]:block">{COPY.topBar.note}</p>
            <p className="whitespace-nowrap">{COPY.topBar.meta}</p>
          </div>
        </div>

        {/* THE HEADER — the mockup's `.hdr`: sticky, 78px, the page's own
            paper, closed by a 2px INK RULE.

            SOLID, not frosted, and that is the correct call here where it
            would be wrong on half this network: everything below it is a cut
            white shape on a flat paper ground, and a translucent bar would
            put a smear over the tops of the tags. The 2px rule is the same
            edge every object on the site carries.

            `z-50`, above the dropdown panels' own stacking, because those are
            portalled into `<body>` and have to sit under the bar they hang
            from rather than over it. */}
        <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream">
          <div className={`${WRAP} flex min-h-[78px] items-center justify-between gap-5 py-2.5`}>
            {/* The strapline under the wordmark goes first when the row runs
                out of width: at 375px the tag, the name and the burger take
                the whole row, and the three words underneath are the one part
                a reader already has from the page itself. The mockup hides it
                at the same place, in `@media(max-width:420px)`. */}
            <Logo taglineClassName="hidden min-[26rem]:block" />

            <nav aria-label="Main navigation" className="hidden md:block">
              <ul className="flex items-center gap-1" role="list">
                {navLinks.map(({ href, label }) =>
                  href === '/casinos' && categoryMenuItems.length > 0 ? (
                    <NavDropdown key={href} label={label} href={href} allLabel={COPY.nav.allCasinos} itemBasePath="/categories" items={categoryMenuItems} triggerClassName={NAV_LINK} {...NAV_PANEL} />
                  ) : href === '/special-offers' && bonusMenuItems.length > 0 ? (
                    <NavDropdown key={href} label={label} href={href} allLabel={COPY.nav.allOffers} itemBasePath="/bonuses" items={bonusMenuItems} triggerClassName={NAV_LINK} {...NAV_PANEL} />
                  ) : (
                    <li key={href} className="flex">
                      <Link href={href} className={NAV_LINK}>
                        {label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            {/* NO FORM HERE. The strip below carries it at every width — see
                the comment there — so the header is the mark and the nav and
                nothing else, which is how the mockup draws it. */}

            {/* Below md the nav strip above is hidden and this menu replaces it. */}
            <MobileNav
              links={navLinks}
              groups={{
                '/casinos': { allLabel: COPY.nav.allCasinos, items: categoryMenuItems, itemBasePath: '/categories' },
                '/special-offers': { allLabel: COPY.nav.allOffers, items: bonusMenuItems, itemBasePath: '/bonuses' },
              }}
              theme={NAV_MOBILE}
            />
          </div>
        </header>

        {/* THE SUBSCRIBE STRIP. The mockup has no form at all; this is the
            network's own rule, and it is a real one: a site with no subscribe
            path above the fold has no subscribe path on a phone.

            A YELLOW BAND closed by a 2px ink rule — the shop's own flash of
            colour, and the one full-width block of it on the site. Ink on the
            yellow is 12.92:1, so everything in the row is simply ink.

            OUTSIDE THE <header>, and that is the whole reason it is a second
            element rather than a second row inside it. Inside, it would
            inherit `position: sticky` and cost ~86px of every phone screen on
            top of the header's own 78 — over a fifth of an 812px viewport,
            permanently, on every page. Out here it scrolls away under the
            header once it has been seen, which is all a subscribe row needs
            to do.

            The heading and its line are the first thing to give when the row
            narrows: the field beside them carries its own label, so nothing
            is lost below `md` except the explanation. */}
        {SUBSCRIBE_ENABLED && (
          <section className="border-b-2 border-ink bg-accent" aria-label="Newsletter">
            <div className={`${WRAP} flex flex-wrap items-center justify-between gap-x-7 gap-y-4 py-[22px]`}>
              <div className="hidden min-w-0 flex-1 md:block">
                <p className="font-display text-[26px] text-ink">{COPY.newsletter.barLead}</p>
                <p className="mt-1.5 text-[14.5px] font-medium text-ink-soft">{COPY.newsletter.barTail}</p>
              </div>
              {/* `compact` = no intro: the two lines beside it are the intro. */}
              <NewsletterForm compact tone="bar" className="w-full md:w-auto md:flex-[1_1_460px] md:max-w-[460px]" />
            </div>
          </section>
        )}

        <div className="flex-1">{children}</div>

        {/* Subscribe, a SECOND time, directly above the footer.

            The yellow strip under the header scrolls away, so on a page this
            long someone who reads to the end has no way in without going back
            up. Here it is a WHITE CARD on the same 2px ink edge and hard
            offset shadow as everything else — not a second yellow band, which
            would make the page's one flash of colour into wallpaper, and not
            a full-bleed strip, because the footer directly beneath it is
            already a full-bleed block of ink and two bands touching would
            read as one confused one. */}
        {SUBSCRIBE_ENABLED && (
          <section className={`${WRAP} mt-[110px]`} aria-label="Newsletter">
            <div className="flex flex-wrap items-center justify-between gap-8 rounded-2xl border-2 border-ink bg-paper px-7 py-11 shadow-[6px_6px_0_var(--color-ink)] sm:px-11">
              <div className="min-w-[260px] flex-[1_1_340px]">
                <span className="lbl block text-[13px] text-brand">{COPY.newsletter.bandKicker}</span>
                <h2 className="font-display mt-3 text-[clamp(30px,3.6vw,46px)] text-ink">
                  {COPY.newsletter.bandTitle}
                </h2>
                <p className="mt-3.5 max-w-[440px] text-[16.5px] text-ink-soft">{COPY.newsletter.bandSubtitle}</p>
              </div>
              {/* `compact` = no intro: the card carries the heading itself. */}
              <NewsletterForm compact className="min-w-[260px] flex-[1_1_380px] lg:max-w-[440px]" />
            </div>
          </section>
        )}

        {/* Footer — the mockup's `.ftr`: the INK ground, carrying the brand
            and its line, Explore / Legal / Policies, and the legal bar.

            NO TOP RULE and no band opening it. The ink arrives against the
            paper with a 16:1 step between them, which is the hardest edge on
            the site already; a stripe over it would be decorating a boundary
            that needs no help. This is the only dark surface here, and the
            only place the yellow is allowed to carry text — 12.92:1 on the
            ink, against 1.26 on the paper. */}
        <footer className="relative mt-[110px] bg-navy text-night-faint">
          <div className={`${WRAP} relative pb-7 pt-16`}>
            <div className="flex flex-wrap justify-between gap-10">
              <div className="max-w-[360px] flex-[1_1_260px]">
                {/* The Logo component itself, so the tag and the wordmark
                    here can never drift from the header's. */}
                <Logo onDark />
                <p className="mt-4 text-[15px] text-night-faint">{COPY.footer.tagline}</p>
                {socialLinks.length > 0 && (
                  <div className="mt-5">
                    <p className={`${FOOTER_HEAD} mb-3`}>Follow us</p>
                    <SocialIcons links={socialLinks} onDark />
                  </div>
                )}
              </div>

              <div className="grid flex-[2_1_480px] grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-6">
                <div>
                  <p className={FOOTER_HEAD}>Explore</p>
                  <ul className="mt-3 flex flex-col">
                    {navLinks.map(({ href, label }) =>
                      href === '/casinos' && categoryMenuItems.length > 0 ? (
                        <FooterNavGroup key={href} label={label} href={href} allLabel={COPY.nav.allCasinos} itemBasePath="/categories" items={categoryMenuItems} linkClassName={FOOTER_LINK} guideClassName="border-night-line" />
                      ) : href === '/special-offers' && bonusMenuItems.length > 0 ? (
                        <FooterNavGroup key={href} label={label} href={href} allLabel={COPY.nav.allOffers} itemBasePath="/bonuses" items={bonusMenuItems} linkClassName={FOOTER_LINK} guideClassName="border-night-line" />
                      ) : (
                        <li key={href}>
                          <Link href={href} className={FOOTER_LINK}>{label}</Link>
                        </li>
                      ),
                    )}
                    {footerPages(FOOTER_EXPLORE).map(({ slug, label }) => (
                      <li key={slug}><Link href={`/${slug}`} className={FOOTER_LINK}>{label}</Link></li>
                    ))}
                  </ul>
                </div>
                <nav aria-label="Legal">
                  <p className={FOOTER_HEAD}>Legal</p>
                  <ul className="mt-3 flex flex-col">
                    {footerPages(FOOTER_LEGAL).map(({ slug, label }) => (
                      <li key={slug}><Link href={`/${slug}`} className={FOOTER_LINK}>{label}</Link></li>
                    ))}
                    <li>
                      <CookieSettingsButton className={FOOTER_LINK} />
                    </li>
                  </ul>
                </nav>
                <nav aria-label="Policies">
                  <p className={FOOTER_HEAD}>Policies</p>
                  <ul className="mt-3 flex flex-col">
                    {footerPages(FOOTER_POLICIES).map(({ slug, label }) => (
                      <li key={slug}><Link href={`/${slug}`} className={FOOTER_LINK}>{label}</Link></li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* The 18+ mark and the legal line, on one rule — the mockup's
                `.legal`. Not `aria-hidden`: the sentence beside it never says
                the age, so a screen reader needs the "18+" too.

                The mockup's `.age` is a 36px disc filled with `--red`, and
                white on that is 4.36:1 at 12px. It takes `--color-brand`
                here, 6.42:1, like every other red thing that carries
                something. */}
            <div className="mt-11 flex flex-wrap items-center justify-between gap-4 border-t border-night-line pt-[22px] text-[14px] text-night-faint">
              <p className="flex min-w-0 flex-[1_1_320px] items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-[12px] font-bold text-white">18+</span>
                <span>
                  <b className="font-semibold text-night-muted">Gamble responsibly.</b> {COPY.footer.disclaimer}
                </span>
              </p>
            </div>

            <div className="mono mt-4 flex flex-wrap justify-between gap-3 text-[13.5px] text-night-faint">
              <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
              {/* Rendered only when an address exists: a freshly cloned site
                  ships with this blank, and an empty <address> is worse than
                  none. `not-italic` is load-bearing — Preflight does not reset
                  the tag's italic default. */}
              {postalAddress !== '' && <address className="not-italic">{postalAddress}</address>}
            </div>
          </div>
        </footer>

        <CookieConsent />
        </ToastProvider>
      </body>
    </html>
  )
}
