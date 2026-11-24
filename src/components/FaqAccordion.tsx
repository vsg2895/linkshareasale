type Item = { readonly question: string; readonly answer: string }

/**
 * CUSTOMER SERVICE — `.faq` / `.fq` in sites/linkshareasale.html.
 *
 * ONE white notice board on a 2px ink edge, its questions parted by 2px ink
 * rules, each one carrying a TICKET NUMBER (Q-001, Q-002) down the left
 * margin in the till face, and opened by a `+` in a 10px square that rotates
 * 45° into an × and fills red.
 *
 * One board, and NOT a card per question, which is what the sibling this site
 * was cloned from does and what most of the network does. The reason is what
 * the thing IS: a shop has one customer-service desk with one list of
 * answers pinned up at it, and seven separate cards would be seven notices.
 * The ticket numbers are what make it one list rather than seven.
 *
 * THE TICKET NUMBER IS HIDDEN BELOW `sm` — the mockup's own
 * `@media(max-width:640px){.fq .q{display:none}}`. At phone width a 72px
 * column of reference numbers is a fifth of the row, spent on something
 * nobody reads, and the question needs every pixel of it.
 *
 * It sits inside the page's `WRAP_NARROW` (840px), because an answer here
 * runs to five or six lines and a 17px paragraph across the full 1240px
 * measure would be about 150 characters a line.
 *
 * Native `<details>`, no client state: every answer is in the server HTML,
 * open or closed — which the FAQPage schema built from the same array needs.
 * `[&::-webkit-details-marker]:hidden` and `list-none` drop the browser's own
 * triangle so only the `+` shows.
 *
 * The first one is open, so the board is never a list of closed rows with
 * nothing to read on it.
 *
 * The ticket number is `aria-hidden`: it is a filing reference, and a screen
 * reader announcing "Q dash zero zero four" before every question is reading
 * the furniture.
 */
export default function FaqAccordion({ items }: { items: readonly Item[] }) {
  return (
    <div className="faq-sheet">
      {items.map((item, i) => (
        <details key={item.question} open={i === 0} className="fq group">
          <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_36px] items-center gap-3.5 p-[18px] [&::-webkit-details-marker]:hidden sm:grid-cols-[72px_minmax(0,1fr)_36px] sm:px-6 sm:py-[22px]">
            <span aria-hidden className="fq-q hidden text-[13px] sm:block">
              Q-{String(i + 1).padStart(3, '0')}
            </span>
            <h3 className="fq-head font-display text-[22px] leading-[1.05] text-ink [overflow-wrap:anywhere] sm:text-[26px]">
              {item.question}
            </h3>
            {/* Decoration: the <summary> already announces its own state. */}
            <span aria-hidden className="pm h-9 w-9 justify-self-end text-[20px] font-extrabold leading-none">
              +
            </span>
          </summary>
          {/* Indented to the question's own left edge from `sm` up — the
              mockup's `padding: 0 72px 24px 110px` — which is what makes the
              answer read as hanging off its question rather than as a second
              paragraph starting at the margin. Flush at phone width, where
              the ticket column is gone. */}
          <p className="fq-answer px-[18px] pb-[22px] text-[16px] leading-[1.7] text-ink-soft sm:pb-6 sm:pl-[110px] sm:pr-[72px] sm:text-[17px]">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  )
}
