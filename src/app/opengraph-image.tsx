import { ImageResponse } from 'next/og'
import { SHARE_IMAGE_ALT } from '@/lib/seo'

/**
 * Dynamic Open Graph / Twitter card image.
 *
 * Until now no og:image existed anywhere while twitter:card was set to
 * `summary_large_image`, so every share of these pages rendered as an empty
 * card — the single most visible SEO/social gap on the site. Generating it here
 * means it can never drift out of sync with the site name, and needs no binary
 * asset committed to the repo.
 *
 * Next.js links this file automatically on the home page only. Every other
 * page sets its own `openGraph`, which REPLACES the layout's (metadata
 * merges shallowly) and drops this card — so those pages restate it via
 * `SHARE_IMAGES` in lib/seo, which also holds the alt text below.
 */
export const alt = SHARE_IMAGE_ALT
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * THE PRICE TAG, at card size.
 *
 * ── Satori has no Archivo and no width axis ──────────────────────────────
 *
 * This card is rendered by Satori, which draws only fonts it is handed as
 * binary data. `next/font/google` fetches Archivo at build time into `.next`
 * under a hashed name, so there is no stable path to read it from here, and
 * fetching a font over the network inside an image route makes the build
 * depend on a third party being up. `font-stretch` is beyond it in any case.
 *
 * So the brand signal on this card is THE TAG, not the face: the yellow swing
 * tag drawn large with its cut shoulder, its punched hole and the two links
 * inside it. The type is whatever Satori has, set in capitals with tight
 * tracking, and it is not pretending to be the site's own condensed face.
 *
 * ── What it does not use ─────────────────────────────────────────────────
 *
 * No `clip-path` (so the tag's shoulder is drawn as an SVG `<path>` instead,
 * which Satori does render), no `filter`, no mask and no pseudo-elements:
 * Satori renders none of those. The strike-through on "FREE" is a positioned
 * block rather than a `::after`, which is the same bar in the same place.
 *
 * Every element with more than one child carries an EXPLICIT `display`, which
 * Satori requires and a browser would have defaulted for us.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          position: 'relative',
          background: '#f4f1ea',
          color: '#141414',
          fontFamily: 'Helvetica, Arial, sans-serif',
          padding: '0 76px',
        }}
      >
        {/* THE CLAIM, at the left — the hero's own order. */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 660 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: 999,
              border: '2px solid #141414',
              background: '#ffd43b',
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Today&apos;s casino markdowns
          </div>

          {/* "FREE", struck out — the hero's own device. The bar is a
              positioned block, because Satori has no pseudo-elements. */}
          <div style={{ display: 'flex', position: 'relative', marginTop: 28 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 86,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: '#6e6a62',
              }}
            >
              Free
            </div>
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                left: -6,
                right: -6,
                top: 52,
                height: 8,
                background: '#e3361f',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginTop: 4,
              fontSize: 86,
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            <span>Every bonus has a&nbsp;</span>
            <span style={{ color: '#b7240f' }}>price.</span>
          </div>

          <div style={{ display: 'flex', marginTop: 26, fontSize: 25, lineHeight: 1.4, color: '#3d3b37' }}>
            The wagering, the stake cap and the withdrawal ceiling, printed on the tag.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 36 }}>
            <div style={{ display: 'flex', width: 46, height: 2, background: '#141414' }} />
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 900, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
              <span>LinkShare</span>
              <span style={{ color: '#b7240f' }}>aSale</span>
            </div>
          </div>
        </div>

        {/* THE TAG, drawn as one SVG path so the cut shoulder survives
            without a `clip-path`. */}
        <div style={{ display: 'flex', marginLeft: 40 }}>
          <svg width="310" height="310" viewBox="0 0 48 48">
            <path
              d="M14 4h20l10 10v30H4V14z"
              fill="#ffd43b"
              stroke="#141414"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="13" r="3.5" fill="#f4f1ea" stroke="#141414" strokeWidth="2" />
            <rect x="11" y="24" width="15" height="10" rx="5" fill="none" stroke="#b7240f" strokeWidth="3" />
            <rect x="22" y="28" width="15" height="10" rx="5" fill="none" stroke="#141414" strokeWidth="3" />
          </svg>
        </div>

        {/* The ink foot, which is where the page ends too. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 62,
            padding: '0 76px',
            background: '#141414',
            color: '#bdb8ae',
            fontSize: 21,
          }}
        >
          18+ · Gamble responsibly · linkshareasale.com
        </div>
      </div>
    ),
    size,
  )
}
