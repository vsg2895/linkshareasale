/**
 * All user-facing and SEO-facing wording for this site.
 *
 * The KEY STRUCTURE is identical across every site in the network — same
 * groups, same keys, same order — so the apps stay interchangeable and a
 * component written for one works on all of them.
 *
 * The WORDS are deliberately unique to this site. That is not decoration: the
 * brands are separate domains serving the same catalogue, and if they shipped
 * the same titles, descriptions and headings, Google would treat them as
 * duplicate content and suppress all but one. Every string that reaches a
 * <title>, a meta description, an <h1>/<h2> or a JSON-LD field must therefore
 * read differently here than on the sibling sites.
 *
 * ── linkshareasale's angle: A BONUS IS NOT A GIFT. IT IS A PURCHASE. ───────
 *
 * Its unit is THE PRICE, and that is the one stance no sibling takes.
 *
 * The thought is this. Every word written about casino bonuses, by operators
 * and by comparison sites alike, treats them as something given: a welcome
 * GIFT, FREE spins, a bonus you CLAIM. The grammar of it is the grammar of a
 * present, and a present has no price, so there is nothing to compare. But a
 * bonus is a transaction and it has a price in three parts — a deposit you
 * must put in first, a wagering requirement you must turn over before the
 * money is yours, and a ceiling on what you may take out at the end. Those
 * three are what you pay. The headline figure is only what you get.
 *
 * So this site is a shop. Everything on it is priced: a casino hangs on the
 * rail as a price TAG with the figure on the front, bonuses are sorted into
 * AISLES, offers are COUPONS, and the top three print on a RECEIPT. The
 * metaphor is not a theme laid over a comparison table; it is the argument.
 * A shop that showed you only its sale signs and never a price would not be
 * a shop, and that is exactly what a bonus page usually is.
 *
 * The clean lines against the nearest siblings, all of which are close enough
 * to matter: affliliate DECODES one offer and works out what it is worth in
 * money — this site is not computing a value, it is naming a cost;
 * rollofjoy counts what an offer costs you in EVENINGS, which is time rather
 * than terms; bonanzasmile promises NO NASTY SURPRISES, which is a
 * reassurance where this is a claim about what the thing is; spinsunny owns
 * WHEN an operator lets you see a figure; baccardrooms owns which KIND of
 * contract you are walking into; avantlinks owns what must be true before the
 * link is pressed. Never write "decoded", "what it's really worth", "the
 * catch", "in daylight" or "nothing hidden" here.
 *
 * ── The shop is a metaphor, not a claim ───────────────────────────────────
 *
 * The mockup leans hard on first-person play, and NONE OF IT SHIPS:
 *
 *   "We claim every bonus ourselves — deposit, play the wagering, cash out —
 *   then tag the true value"; both proof figures ("Real money / tested at
 *   every casino" and "Weekly / terms re-checked"); the FAQ's "We open real
 *   accounts, deposit, claim the bonus and request a withdrawal"; "We publish
 *   the times we observed"; and the receipt's "FAIR TERMS ✓", which is a
 *   blanket guarantee over a list this site does not underwrite.
 *
 * This project reads published pages. It does not fund accounts, clear
 * wagering or time withdrawals — and a site whose whole argument is that a
 * price should be printed honestly is the last place to print one it made
 * up. Every figure here is quoted from an operator's own pages, and the
 * method band says so in as many words.
 *
 * Four more mockup elements are absent for the same family of reasons:
 *
 *   - the per-tag "Min. deposit" and "Payout" facts, and the glance sheet's
 *     "Avg. payout time: Under 1 hour" — no column in this API holds either,
 *     so both would be invented per casino. The irony is not lost: the
 *     deposit IS the first part of the price this site is about, and it is
 *     the one part the data does not have. Saying so is better than
 *     inventing it, and the method band names it as something to read on the
 *     cashier page rather than a figure quoted here;
 *   - the country <select>, because the catalogue filters by category and not
 *     by geography, and a control that silently does nothing is worse than no
 *     control;
 *   - the top bar's "New this week: fresh deals tagged — every bonus
 *     re-checked before it goes on the rail", which is a test claim AND a
 *     thing that happened "this week" printed on a statically generated page
 *     where it would still say so in March;
 *   - the detail banner's giant "SALE", which shouts a discount over a page
 *     arguing that there is a price. The banner carries the barcode instead,
 *     which is the receipt's mark and claims nothing.
 */

export const COPY = {
  // SEO identity. These three reach the <title>, the meta description and the
  // keywords tag on EVERY page that does not set its own — which is most of
  // them — so they are the strings most likely to be read as duplicate content
  // if a sibling domain ships the same words.
  site: {
    titleTail: 'Casino Bonuses, Priced Up',
    description:
      'prices up online casino bonuses: what each one asks for in return — the wagering, the stake cap, the withdrawal ceiling and the expiry — printed on the tag beside the headline figure, not two clicks behind it.',
    keywords: [
      'what casino bonuses actually cost',
      'wagering requirements compared',
      'casino bonus max bet and withdrawal cap',
      'casino bonus terms before you deposit',
      'independent casino rankings',
    ],
    // The strapline under the wordmark, in the header and the footer. The
    // mockup's own: three words, and it says what the shop does.
    editionLabel: 'Casino deals, tagged',
    mastheadStrapline: 'Casino deals, tagged',
    // The wordmark, split so the tail can take the red — the mockup's
    // `LinkShare<i>aSale</i>`.
    wordmarkHead: 'LinkShare',
    wordmarkTail: 'aSale',
  },
  // ── The top bar ──────────────────────────────────────────────────────────
  // The mockup's strip above the header. Its left-hand line is "New this
  // week: fresh deals tagged — every bonus re-checked before it goes on the
  // rail": a test claim, and a thing that happened "this week" printed on a
  // page that is generated once. Replaced with the one sentence that is true
  // on every build and is also the whole method.
  topBar: {
    note: 'Every price on this site is quoted from the operator’s own bonus terms and cashier pages.',
    meta: 'Independent reviews · 18+ only',
  },
  nav: {
    casinos: 'Casinos',
    // The page lists every visible bonus, flat and ungrouped, so the menu says
    // what is behind it. winpalack keeps "Special Offers": its page is the
    // grouped bonus-area view and is a different thing.
    specialOffers: 'Bonuses',
    categories: 'Categories',
    // First row inside the header and footer dropdowns: the parent's own page.
    allCasinos: 'All Casinos',
    allOffers: 'All Offers',
  },
  home: {
    // The heading over the home page's offers — the mockup's own.
    bonus: 'Bonus Coupons',
    // The line under it. The mockup's is "Deals worth sharing — terms checked
    // before we list them", which claims a check this site does not perform
    // as a gate. This says what is actually printed on a coupon.
    bonusesSubtitle:
      'Each one carrying the figure its operator leads with — and, wherever the operator states it, what that figure asks for in return.',
    seeMore: 'See more',
    seeAllBonuses: 'See All Coupons',
    /**
     * The VISIBLE heading over the bonus-type panel.
     *
     * The row used to carry no heading at all — the cells were taken to
     * speak for themselves. They do not: arriving mid-page at a panel of
     * unlabelled links, there is nothing saying what the set IS, and
     * nothing a screen reader can announce for the landmark.
     */
    bonusTypesTitle: 'Browse By Aisle',
    // The hero's eyebrow — the mockup's own.
    heroEyebrow: 'Today’s casino markdowns',
    // ── THE HEADLINE ──────────────────────────────────────────────────────
    // Four parts, because the mockup's own headline is a struck-out phrase
    // over a coloured one and this site's whole argument fits that shape.
    //
    // The mockup writes "Full price / Better deals", which is an
    // advertisement's framing and the opposite of what this site says — it
    // promises a discount where the argument is that there is a PRICE. The
    // device is kept and the words are turned round: strike out the word
    // every bonus page uses, and name the thing it hides.
    heroStrike: 'Free',
    heroHeadline: 'Every bonus has a',
    heroHighlight: 'price',
    heroHeadlineTail: '.',
    heroSubtitle:
      'A casino bonus is not a gift, it is a purchase — and you pay for it three times over: with a deposit before it exists, with a wagering requirement before the money is yours, and with a ceiling on what you may take out at the end. That is the price, and it is printed on the tag here at the same size as the headline figure. A shop that showed you only its sale signs would not be showing you a price at all.',
    // The exact phrase inside heroSubtitle that takes the EMPHASIS. Kept as a
    // key rather than as markup so the string above stays plain text,
    // readable in a <title> and in JSON-LD with no tags to strip. The page
    // splits on it; if it ever stops matching, the deck simply renders
    // unmarked rather than breaking.
    heroSubtitleMark: 'printed on the tag here',
    // The byline under the hero. The mockup has two proof figures there, both
    // claims about testing — see the file header. What belongs above the fold
    // on a site that earns a commission is the commission.
    heroBylineName: 'Independently ranked',
    heroBylineNote: 'Our links earn a commission. They do not buy a place on the rail.',
    // ── THE RECEIPT ───────────────────────────────────────────────────────
    podiumBadge: 'Today’s top 3',
    podiumTitle: 'Deal receipt',
    podiumSubtitle: 'The three highest-placed casinos in this ranking.',
    // The label on a top-three entry's rating. The mockup prints a minimum
    // deposit there; nothing in the API holds one, so the slot carries the
    // rating.
    podiumRatingLabel: 'Rated',
    // The receipt's total line and its footer. The mockup totals with
    // "FAIR TERMS ✓" — a blanket guarantee over a list this site does not
    // underwrite — so the total says where the figures came from instead.
    receiptSource: 'Prices from the operator',
    receiptFoot: 'Thank you · play responsibly',
    podiumAll: 'See the whole rail',
    topCasinosTitle: 'The Rail, Priced Up',
    topCasinosSubtitle:
      'Every casino in the shop, ordered on what it publishes about its licence, its bonus terms and its cashier. Filter by category.',
    featuredCasinos: 'Shop the casinos',
    specialOffers: 'See bonus coupons',
    viewAll: 'View all',
    // Leads the home <title>; the year and brand are appended in page.tsx.
    homeTitle: 'What Casino Bonuses Actually Cost',
    faqTitle: 'Questions At The Till',
    faqSubtitle: 'How a price gets read, what we will not claim, and what the link at the end of a tag does.',
    metaDescription:
      'Online casino bonuses with the price on the front of the tag: the wagering and what it applies to, the stake cap while clearing, the withdrawal ceiling and the expiry — each quoted from the operator’s own terms.',
    // ── The "How a deal gets priced" band ─────────────────────────────────
    // THREE READS, named after three places in a shop, in the order they
    // decide whether a deal is worth anything: what the label says and
    // whether you may buy at all, what the thing costs, and what happens
    // when you want your money back.
    //
    // The mockup's own three steps describe a funded account and a timed
    // withdrawal. See the file header: none of that ships. These are reads
    // of pages anyone can open.
    methodTitle: 'How a deal gets priced',
    methodSubtitle: 'Three reads, in the order they decide whether a bonus is worth anything.',
    methodSteps: [
      {
        no: '01',
        verb: 'The label',
        title: 'What it says, and whether you may buy',
        body:
          'The regulator named in the operator’s footer, checked against that regulator’s own public register, and the list of countries the operator itself says it accepts. This is first because it is the only read that can end the matter: an account opened from a country the terms exclude can be closed at withdrawal with the balance forfeited, and every operator reserves that right in writing. A price you are not allowed to pay is not a price.',
      },
      {
        no: '02',
        verb: 'The price',
        title: 'What the bonus asks for in return',
        body:
          'The wagering multiplier and exactly what it is applied to — the bonus alone, or the bonus and the deposit together, which is the same headline figure at twice the cost. Then the maximum stake allowed while clearing it, which games count and at what weighting, and when the offer expires. The deposit you have to put in first is part of the price too; this site does not hold that figure for every operator, so where it is not stated the method says to read it on the cashier page rather than quoting a number it does not have.',
      },
      {
        no: '03',
        verb: 'The returns desk',
        title: 'What happens when you want the money',
        body:
          'The withdrawal methods the operator publishes, the minimum and maximum it will process, any weekly or monthly ceiling, the processing window it states, and the point at which identity documents are demanded. We do not time a payout and we do not print one. What is recorded is what the operator has committed to in writing — which is the part you could hold it to, and the part a headline figure never mentions.',
      },
    ],
    // NOT 'How a deal gets priced': that is `methodTitle`, and a kicker
    // printing the heading again two lines above it is a second name for the
    // section that happens to be the same name.
    methodLabel: 'What we read',
    // Under the three reads: the one thing left to say, and the reason it
    // sits here rather than in a policy page.
    methodLoop:
      'And the price of this shop, while we are on the subject: we earn a commission when you join through a link here. It pays for the reading. It buys no place on the rail, and no operator sees a ranking before you do.',
    // ── What one review covers ────────────────────────────────────────────
    monitorTitle: 'What a review covers',
    monitorStatus: 'Every tag',
    monitorReads: [
      { label: '01 · The label', text: 'The regulator, its register, and the countries accepted' },
      { label: '02 · The price', text: 'Wagering and what it applies to, max stake, expiry' },
      { label: '03 · The returns desk', text: 'Methods, ceilings, the stated window, when ID is asked for' },
    ],
    monitorNote:
      'A lapsed offer comes off the rail. A tag changes when the operator’s own pages change, and for no other reason.',
    // The kickers over each section head.
    rankingLabel: 'On the rail',
    bonusTypesKicker: 'Shop by aisle',
    bonusesLabel: 'Clip & claim',
    faqLabel: 'Customer service',
  },
  casinos: {
    pageTitle: 'Every Casino On The Rail',
    pageDescription:
      'The full ranking, each casino tagged with the bonus it is running, what that bonus asks for in return and the countries it says it accepts.',
    // H2 over the offers block on a casino page. The literal 'Special Offers'
    // was hardcoded in the component on all six sites — an identical H2 on
    // every review page in the network.
    offersHeading: 'Coupons On This Tag',
    // Tail of the summary-panel H2: `{casino.name} at a glance`.
    glanceHeadingTail: 'at a glance',
    moreHeading: 'Other Casinos On The Rail',
    reviewTitleTail: 'Licence, Bonus Price And Withdrawals',
    reviewSignature:
      'Every figure on this page is quoted from this operator’s own terms, cashier and licence pages.',
    reviewSummary:
      'with the three things that decide what its bonus actually costs — what the label says and whether you may buy, what the offer asks for in return, and what happens when you want the money back — taken from the operator’s own pages rather than its banner.',
    // The kicker over the bonus figure on a tag — the mockup's `.price small`,
    // which says "Welcome bonus". Nothing in the API says the figure on
    // `casino.bonuses` IS a welcome bonus, so this does not claim it is.
    bonusLabel: 'On the tag',
    // The sticker on the leader's tag. The mockup's own, and an editorial
    // label rather than a figure. No rank numeral anywhere on this network:
    // the <ol> order is the ranking.
    topPick: 'Best deal',
    visitCasino: 'Open Casino',
    readReview: 'Read Review',
    rating: 'Deal Score',
    noResults: 'Nothing on this rail for that filter yet.',
  },
  /**
   * The page behind one bonus type — one AISLE (/bonuses/[slug]).
   *
   * `metaSuffix` is appended to the aisle's name when the admin wrote no
   * description, so the meta line is still specific to the page rather than
   * boilerplate shared by eight of them.
   */
  bonusCategory: {
    // The word before an aisle's number — "Aisle 04".
    aisleLabel: 'Aisle',
    metaSuffix:
      'every offer of this kind in the shop, with whose casino it is and the figure the operator leads with — plus what that figure asks for in return.',
    countOne: 'offer',
    countMany: 'offers',
  },

  specialOffers: {
    pageTitle: 'Every Coupon In The Shop',
    pageDescription:
      'All of the bonuses in one place, each with the casino behind it and the figure it leads with — and, wherever the operator states them, the wagering, the ceiling and the expiry that figure comes with.',
    // Appended to an offer's (shared) bonus text so the sibling sites do not
    // ship an identical meta description for the same offer.
    offerMetaSuffix: 'Read from the operator’s own bonus terms, not its banner.',
    claim: 'Claim Deal',
    noResults: 'No coupons in the shop right now.',
  },
  categories: {
    pageTitle: 'Casinos By Category',
    pageDescription: 'The same three reads behind every list — pick the category you came in for.',
    // Meta-description tail for a single category page. Category records are
    // shared master data, so this is what keeps the sites distinct there.
    categoryMetaSuffix:
      'ordered on what each operator publishes about its licence, its bonus terms and its cashier — priced up before the link rather than after it.',
    noResults: 'Nothing in this category yet.',
  },
  newsletter: {
    title: 'The weekly markdowns.',
    subtitle: 'New casinos on the rail, the coupons worth clipping, and any tag that changed — one short email.',
    placeholder: 'you@example.com',
    button: 'Subscribe',
    // The two halves of the line in the HEADER STRIP — a band directly under
    // the header, outside it, so it scrolls away once it has been seen.
    barLead: 'The weekly markdowns.',
    barTail: 'New casinos on the rail, the coupons worth clipping, and any tag that changed — one short email a week.',
    // The band above the footer — the site's second capture point, so its
    // heading is a real <h2> rather than the form's own label.
    bandKicker: 'The list',
    bandTitle: 'One email a week, before you go shopping.',
    bandSubtitle:
      'New casinos on the rail, the coupons we think are worth clipping, and any price that moved — short, and never more than once a week.',
    // Shown while the address is being checked. The subscribe request waits on
    // a live address-validation call, so the button has to say so rather than
    // just dimming for a second or two.
    checking: 'Checking…',
    // The spam line is NOT optional wording. This is a double opt-in list: an
    // unconfirmed subscriber never receives anything again, and the verify mail
    // is the single most likely message to be filtered — new sender, one link,
    // no history. Telling people where to look is the difference between a
    // signup and a dead row.
    success:
      'Nearly there — check your inbox and confirm your address to finish. '
      + 'If nothing arrives, it may be sitting in spam or junk.',
    // Shown when the API reports email_sent=false — the site is still
    // collecting addresses but its sending is switched off in the admin.
    successNoEmail:
      'You’re on the list. We are not sending confirmation emails from this site at the moment.',
    error: 'That did not send. Please try again.',
  },
  footer: {
    // Short brand blurb in the footer's first column. The mockup gives that
    // column 1.6fr of a four-track grid — roughly 360px — so this runs to two
    // or three lines there by design.
    tagline:
      'Independent casino reviews and rankings, with the price of every bonus printed on the front of the tag and quoted from the operator’s own pages. We earn a commission from links on this site; it never changes a score or a position.',
    // Registered postal address, shown beside the copyright line. A physical
    // address in the footer is what mailbox providers and the gambling
    // affiliate compliance checks both look for, and it must match the address
    // used in the email templates.
    //
    // Supplied 2026-11-24, and written to this site's `registered_address`
    // in the same change (`php artisan sites:set-legal-identity <slug>
    // --address=...`). THE TWO MUST STAY IDENTICAL: that column is what the
    // legal pages and the email templates print, and two different addresses
    // for one brand is a compliance problem, not a typo. The footer omits the
    // whole <address> element while this is blank.
    postalAddress: '19 Bramble Way, Carlisle, CA2 7NX, United Kingdom',
    disclaimer:
      'Gambling is for adults aged 18 or over and carries real financial risk. Set deposit limits, never chase losses, and only stake what you can afford to lose.',
  },
  errors: {
    notFound: 'That page is not here.',
    apiError: 'Could not load this content. Please try again in a moment.',
  },
  reviews: {
    heading: 'What Players Report',
    empty: 'No reports yet — be the first to add one.',
    formTitle: 'Add Your Report',
    formIntro: 'Your report appears on this page as soon as you post it.',
    nameLabel: 'Your name',
    emailLabel: 'Email (optional, never published)',
    ratingLabel: 'Rating',
    titleLabel: 'Headline (optional)',
    bodyLabel: 'Your report',
    namePlaceholder: 'First name or nickname',
    emailPlaceholder: 'you@example.com',
    titlePlaceholder: 'One line on whether the price matched the terms',
    bodyPlaceholder: 'What did the bonus ask for, and did the operator stick to it?',
    submit: 'Post Report',
    // Two outcomes, because the site can run pre- or post-moderation
    // (Sites -> Publish reviews immediately). The API reports which one
    // applied; promising the wrong one is a promise the page then breaks.
    success: 'Thanks — your report is now live. Scroll up to see it.',
    successPending: 'Thanks — your report has been submitted and will appear once approved.',
    error: 'That did not send. Please check the form and try again.',
    ratingSummary: (avg: number, total: number) =>
      `${avg.toFixed(1)} out of 5 from ${total} ${total === 1 ? 'report' : 'reports'}`,
  },
  // Labels on the phone-only hide / show toggle above each chip list.
  collapse: {
    casinoCategories: 'Casino categories',
    bonusTypes: 'The aisles',
  },
} as const
