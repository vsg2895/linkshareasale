'use client'

import { useState } from 'react'
import { COPY } from '@/constants/copy'
import { useToast } from '@/components/ToastProvider'
import { isValidEmail } from '@/lib/email'

/**
 * `compact` means NO INTRO — the field and the button alone, without the title
 * and subtitle the component otherwise prints above them.
 *
 * Both of this site's capture points are compact: the band above the footer
 * already carries an <h2> and its line, and the header has room for a field
 * and nothing else. Letting the form print its own pair on the band would
 * publish both twice, once as a heading and once as a paragraph. The
 * accessible name still carries the copy either way (`aria-label` on the form).
 *
 * It does NOT mean "small": the smaller mode is 46px, over the 44px tap
 * target, and the larger is 52px.
 *
 * `tone` is WHICH OF THE TWO CAPTURE POINTS this is, and on this site the
 * two stand on different grounds:
 *
 *   'bar'  — the YELLOW BAND under the header, this site's primary capture
 *            point, present at every width. The field is WHITE so it is a
 *            hole cut in the yellow rather than a shape sitting on it, and
 *            everything written in the row is simply ink (12.92:1). 46px,
 *            `.btn-sm`.
 *   'band' — the WHITE CARD above the footer. The field takes the PAPER
 *            colour there, so it is a hole cut in the card by the same logic.
 *            54px, the full `.btn`.
 *
 * Both fields carry the 2px ink border every control on this site has, so
 * neither needs a `line-strong` and neither can be mistaken for a panel.
 *
 * TWO SEPARATE SHAPES WITH A 10px GAP, in both tones — the mockup's own
 * `.sub-form{gap:10px}`, and the opposite of the siblings that draw one box
 * around the pair. On this site the field and the key are both on the 12px
 * control rung of the radius ladder, and that rung is what says they are
 * controls; welding them into one outline would make them a single object and
 * put the pair on a rung of its own for no reason.
 *
 * A boolean would have been enough today and wrong tomorrow: the next ground
 * this form lands on gets its own name here rather than a second flag.
 */
export default function NewsletterForm({
  compact = false,
  tone = 'band',
  className = '',
}: {
  compact?: boolean
  tone?: 'band' | 'bar'
  className?: string
}) {
  const onBar = tone === 'bar'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [website, setWebsite] = useState('')
  // A domain-typo correction from SendGrid, e.g. user@gmial.com -> gmail.com.
  // The ONLY validation detail ever shown to a visitor: it is about their own
  // address, and it turns a dead form into a corrected signup.
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null)
  const toast = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!isValidEmail(email)) {
      toast('Please enter a valid email address.', 'error')
      return
    }
    setLoading(true)
    setSuggestedEmail(null)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      if (!res.ok) {
        // Surface backend validation (e.g. 422 "You are already subscribed.").
        const data = (await res.json().catch(() => ({}))) as {
          message?: string
          errors?: { email?: string[] }
          suggested_email?: string | null
        }

        setSuggestedEmail(data.suggested_email ?? null)
        toast(data.errors?.email?.[0] ?? data.message ?? COPY.newsletter.error, 'error')
        return
      }
      // The API reports whether a verification email is actually going out
      // (`email_sent` mirrors the site's newsletter_emails_enabled switch).
      // Telling someone to watch their inbox — and dig through spam — for mail
      // this site is not sending would be a worse failure than not collecting
      // the address at all.
      const { email_sent: emailSent } = (await res.json().catch(() => ({}))) as { email_sent?: boolean }

      // Keep the form in place; confirm via a top-corner toast.
      toast(emailSent === false ? COPY.newsletter.successNoEmail : COPY.newsletter.success, 'success')
      setEmail('')
    } catch {
      toast(COPY.newsletter.error, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={compact ? `min-w-0 ${className}`.trim() : `flex flex-wrap items-center justify-between gap-4 ${className}`.trim()}>
      {/* The strip's introduction. The compact form drops it: see above. */}
      {!compact && (
        <div className="min-w-0 flex-[1_1_360px]">
          <p className="font-display text-[24px] leading-tight text-ink">{COPY.newsletter.title}</p>
          {/* 14px on a phone, 13px from `sm` up. Below `lg` this strip is the
            ONLY subscribe path on the site (the header pill drops its form),
            so the line that explains what you get has to clear the project's
            14px phone readability floor — which the globals.css rule only
            raises for `.text-xs`, not for a literal size. */}
        <p className="mt-1.5 text-sm font-medium text-ink-soft sm:text-[13.5px]">{COPY.newsletter.subtitle}</p>
        </div>
      )}

      <div className={compact ? 'w-full min-w-0' : 'w-full min-w-0 flex-[0_1_420px]'}>
        {/* Field and button share one row at every width, as in the mockup;
            `min-w-0` lets the field give way so the button never wraps. */}
        <form
          onSubmit={onSubmit}
          // TWO SHAPES, 10px apart, each carrying its own edge and its own
          // 12px radius — the mockup's `.sub-form{display:flex;gap:10px}`.
          // The form itself draws nothing: there is no enclosing box and no
          // focus ring here, because each control has a visible edge of its
          // own and shows its own focus.
          //
          // A ROW AT EVERY WIDTH, in both tones, which is where this departs
          // from the mockup — its own `@media(max-width:640px)` stacks the
          // pair. The strip sits at the top of every page on this site, and
          // stacked it costs ~106px of a 375px screen instead of ~48px, on
          // every page, for a signup nobody arrived for. It does not need the
          // height: the field gives way (`min-w-0` plus `flex-1`) and the key
          // tightens its padding, leaving a ~230px field at 375px, which is
          // wider than most addresses people type.
          className="relative flex flex-row gap-2.5"
          aria-label={`${COPY.newsletter.title} ${COPY.newsletter.subtitle}`}
        >

          {/* HONEYPOT. Never shown, never focusable, never autofilled — a human
              cannot reach it, a naive bot fills every field it finds. The server
              rejects any request that carries a value, before the site is
              touched and long before a paid validation credit could be spent.
              Positioned off-screen rather than display:none, which some bots
              skip. */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            // Hidden by an INLINE STYLE, deliberately not by a Tailwind class.
            // The class was a real bug: utility CSS can load late, fail, or be
            // purged, and for as long as it is missing this renders as an
            // ordinary focusable text input sitting in the middle of the
            // subscribe form. A person who types into it gets their signup
            // rejected as a bot — an anti-bot measure silently turning away the
            // humans it exists to protect. An inline style travels inside the
            // HTML, so it cannot desync from the markup that carries it.
            //
            // Still off-screen rather than display:none or the hidden
            // attribute: a honeypot only works while a bot believes the field
            // is real, and the obvious ways of hiding it are the ways a bot
            // checks for. pointer-events:none means that even a rendering
            // accident cannot let a human click into it.
            style={{
              position: 'absolute',
              left: '-9999px',
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={COPY.newsletter.placeholder}
            aria-label={COPY.newsletter.placeholder}
            autoComplete="email"
            // 48px in BOTH tones. `compact` means "no intro", not "small":
            // the sibling sites shrink the field to 42px for a header pill,
            // and 42px is under the 44px tap target.
            // `flex-1` IS BREAKPOINT-PREFIXED, and that is load-bearing.
            // The band form is `flex-col` on a phone and only becomes a row
            // further up. `flex-1` is `flex: 1 1 0%`, and flex-basis applies
            // to the MAIN axis — so in column mode it zeroed the field's
            // HEIGHT, and the `h-12` beside it lost: the subscribe field
            // shipped 22.5px tall on a phone, half its size and half the tap
            // target. In row mode it is still needed, or `w-full` takes the
            // whole line and pushes the key out. So it applies only from the
            // width the form actually becomes a row.
            //
            // A HOLE CUT IN WHATEVER IT SITS ON — white in the yellow band,
            // paper in the white card. That is the mockup's own idea for a
            // field inside a coloured strip, and it needs two sets of colours
            // here because this form lands on two grounds (see `tone`).
            //
            // The border is the site's own 2px of INK at 18.42:1 rather than
            // a hairline, so a field is built exactly like every other
            // control here and no `line-strong` is needed anywhere.
            //
            // Heights are pinned to the BUTTON beside them — 46 against
            // `.btn-sm`, 54 against the full `.btn` — because those classes
            // are unlayered and pin their own `min-height`, so a field set to
            // some other number would simply be short of its neighbour for
            // ever.
            //
            // The focus outline is 3px of the YELLOW, offset 2px, which is
            // the mockup's own on its `select` and is the one state colour
            // that reads against both the white and the ink.
            className={
              onBar
                ? 'h-[46px] w-full min-w-0 flex-1 rounded-xl border-2 border-ink bg-white px-3.5 text-[15px] font-medium text-ink placeholder:text-muted focus:outline-[3px] focus:outline-offset-2 focus:outline-ink'
                : 'h-[54px] w-full min-w-0 flex-1 rounded-xl border-2 border-ink bg-cream px-4 text-[15px] font-medium text-ink placeholder:text-muted focus:outline-[3px] focus:outline-offset-2 focus:outline-ink'
            }
          />
          <button
            type="submit"
            disabled={loading}
            // THE RED PRIMARY IN BOTH TONES. It works on the yellow and on
            // the white alike because its own boundary is the 2px ink border
            // every control here carries — the red never has to hold an edge
            // against a ground. White on it is 6.42:1.
            //
            // 46px on the band under the header (`.btn-sm`) and the full 54
            // on the card above the footer, both over the 44px tap target.
            // `btn-flat` on the bar: the yellow strip is a fixed row and a
            // button stepping 2px out of it on hover drags the field's
            // baseline with it.
            className={
              onBar
                ? 'btn-or btn-sm btn-flat shrink-0 whitespace-nowrap focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60'
                : 'btn-or shrink-0 whitespace-nowrap focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60'
            }
          >
            {loading ? COPY.newsletter.checking : COPY.newsletter.button}
          </button>
        </form>

        {/* One click swaps the address in and resubmits. The corrected address
            is a DIFFERENT cache key upstream, so it gets its own validation
            call rather than reusing the typo's verdict. */}
        {suggestedEmail && (
          <p className="mt-2 text-sm font-medium text-ink-soft">
            Did you mean{' '}
            <button
              type="button"
              onClick={() => { setEmail(suggestedEmail); setSuggestedEmail(null) }}
              className="font-semibold underline underline-offset-2"
            >
              {suggestedEmail}
            </button>
            ?
          </p>
        )}
      </div>
    </div>
  )
}
