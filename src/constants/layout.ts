/**
 * THE PAGE MEASURE — the mockup's `.wrap` and `.narrow`.
 *
 * ONE pair of values, in a module of their own, because the header, the
 * subscribe strip, the footer and all nine route pages have to line up on the
 * same two columns. The clone this site was built from declared its measure
 * in three places and shipped three different widths — 1160 for the chrome,
 * 1200 for the listings, 94rem for the detail pages — so the header and the
 * footer lined up with nothing on two thirds of the site.
 *
 * Here rather than in `app/layout.tsx`: a page importing from the layout
 * would pull `next/font`, the API client and the whole chrome into its own
 * module graph for the sake of two strings.
 *
 * `WRAP` is 1240px on a 24px gutter — the mockup's own. `WRAP_NARROW` is the
 * 840px it sets for the FAQ and the detail sheets, where the content is
 * paragraphs rather than cards: a 17px paragraph across 1240px runs to about
 * 150 characters a line, double the measure at which a reader reliably finds
 * the start of the next one.
 */
export const WRAP = 'mx-auto w-full max-w-[1240px] px-6'
export const WRAP_NARROW = 'mx-auto w-full max-w-[840px] px-6'
