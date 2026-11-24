import Link from 'next/link'

/**
 * Link Share a Sale brand mark, from sites/linkshareasale.html: A PRICE TAG
 * WITH A CHAIN LINK IN IT.
 *
 * A yellow swing tag with both top corners cut off and a punched hole, and
 * inside it two interlocking link shapes — one red, one ink. It is the brand
 * in one object: a LINK, on a tag, with a price on it.
 *
 * ── The one colour that is not the mockup's ───────────────────────────────
 *
 * The mockup strokes the first link in `#E3361F`, which is 3.06:1 on the
 * yellow. A 3px stroke is a graphic, so that clears the 3:1 bar — but only
 * just, and at the 16px this mark is rasterised to in a browser tab the two
 * links have to be told apart from each other and from the tag behind them.
 * It takes `--color-brand` #B7240F instead, 4.50:1 on the yellow, which is
 * also the red every other red thing on this site uses. One red, measured
 * once.
 *
 * ── The ARTWORK does not invert; the WORDMARK does ───────────────────────
 *
 * The tag carries its own yellow fill and its own 2.5px ink outline, so the
 * drawing is identical in the header, on the ink footer and on a tab. The
 * yellow is 12.92:1 against the ink and 1.26 against the paper — which is
 * exactly why the outline is not optional, in the mark or anywhere else on
 * the site.
 *
 * The WORDMARK's red tail is the one thing that has to change: see the note
 * on it below. `onDark` otherwise only moves the focus ring's offset colour
 * and trims the size for the footer.
 *
 * Inlined SVG rather than an image: it renders instantly with no extra
 * request and stays crisp at any size. The artwork is aria-hidden; the Link's
 * name is its visible text.
 */
export default function Logo({
  className = '',
  taglineClassName = '',
  onDark = false,
}: {
  className?: string
  taglineClassName?: string
  onDark?: boolean
}) {
  return (
    <Link
      href="/"
      className={`inline-flex min-h-11 shrink-0 items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        onDark
          ? 'focus-visible:ring-accent focus-visible:ring-offset-navy'
          : 'focus-visible:ring-ink focus-visible:ring-offset-cream'
      } ${className}`.trim()}
    >
      <svg
        viewBox="0 0 48 48"
        className={onDark ? 'h-[42px] w-[42px] shrink-0' : 'h-12 w-12 shrink-0'}
        aria-hidden="true"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* The tag: both top corners cut, drawn in one path so the outline
            follows the cut. `stroke-linejoin="round"` is what keeps the two
            shoulders from coming to a point. */}
        <path
          d="M14 4h20l10 10v30H4V14z"
          fill="#ffd43b"
          stroke="#141414"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* The punched hole — the paper showing through. */}
        <circle cx="24" cy="13" r="3.5" fill="#f4f1ea" stroke="#141414" strokeWidth="2" />
        {/* The two links, interlocked. */}
        <rect x="11" y="24" width="15" height="10" rx="5" fill="none" stroke="#b7240f" strokeWidth="3" />
        <rect x="22" y="28" width="15" height="10" rx="5" fill="none" stroke="#141414" strokeWidth="3" />
      </svg>

      <span className="flex flex-col leading-none">
        <span
          className={`font-display whitespace-nowrap text-[26px] ${
            onDark ? 'text-night-ink' : 'text-ink'
          }`}
        >
          LinkShare
          {/* The tail — the mockup's `.logo-name i`, which sets it in the red
              in both places it draws the wordmark. ON THE INK FOOTER THAT
              CANNOT SHIP: #B7240F on #141414 is 2.87:1, under even the 3:1 a
              26px bold word would need, and the mockup's brighter #E3361F is
              only 4.22. The tail takes the YELLOW there (12.92:1), which is
              also the footer's own accent — its column heads are already set
              in it — so the mark reads as the same mark in the footer's
              palette rather than as a different one. */}
          <i className={`not-italic ${onDark ? 'text-night-accent' : 'text-brand'}`}>aSale</i>
        </span>
        {/* The strapline. `aria-hidden`: it is a second, shorter name for the
            same link, and a screen reader announcing both would read the
            brand twice over. */}
        <span
          aria-hidden
          className={`lbl mt-1.5 block text-[10.5px] tracking-[0.12em] ${
            onDark ? 'text-night-faint' : 'text-muted'
          } ${taglineClassName}`.trim()}
        >
          Casino deals, tagged
        </span>
        {/* The link's name is its visible text plus this — no aria-label that
            could disagree with what is on screen. */}
        <span className="sr-only"> home</span>
      </span>
    </Link>
  )
}
