/**
 * Frequently asked questions — the mockup's "Customer service", set on one
 * white notice board with a ticket number down the left margin of each row.
 *
 * Rendered VISIBLY on the home page and emitted as FAQPage structured data
 * from this same array. Google requires the two to match; markup-only FAQ is a
 * guidelines violation, which is why the page maps over this constant rather
 * than duplicating the text.
 *
 * The wording is unique to this site: these answers are indexable page content,
 * and they are exactly the kind of text an answer engine quotes. Here they
 * argue one thing — that a bonus is a PURCHASE with a price in three parts,
 * and that the word "free" is doing the work a price tag should. Its siblings
 * answer the neighbouring questions (affliliate: what one offer is worth in
 * money; rollofjoy: what an offer costs in evenings; bonanzasmile: the catch;
 * slottering: the slot rules; bettingbetway: which casino to trust;
 * gladjackpot: how the money gets out; luckycatsmile: that luck is the wrong
 * word; spinsunny: when you get to read the small print; starspinly: one scale
 * for every operator; bigbrightday: whether the terms can be read in one go;
 * goodnewsdrop: what changed since last time; avantlinks: what must be true
 * before the link is pressed; baccardrooms: which kind of contract you are
 * walking into) and none of them may be echoed.
 *
 * NOTHING BELOW CLAIMS A FIGURE THIS SITE CANNOT SHOW. The mockup's own first
 * answer is "We open real accounts, deposit, claim the bonus and request a
 * withdrawal", and its fifth is "We publish the times we observed". Neither
 * ships in any wording: nothing in this project records a funded account or a
 * timed payment. The SECOND question is asked precisely so the answer can say
 * so outright, and the withdrawal question is answered by naming whose
 * commitment the figure actually is.
 *
 * The THIRD question is this site's own, and it is the one no sibling asks:
 * whether a bonus is free. On a site that prices things, that answer is the
 * product.
 */
export const FAQ_ITEMS = [
  {
    question: 'How do you rank the casinos?',
    answer:
      'On three reads, in the order they decide whether a bonus is worth anything. First the label: the regulator named in the operator’s footer, checked on that regulator’s own public register, and the list of countries the operator says it accepts — a price you are not allowed to pay is not a price, and an account opened from an excluded country can be closed at withdrawal. Then the price itself: the wagering multiplier and whether it applies to the bonus alone or to the deposit as well, the maximum stake allowed while clearing it, which games count, and the expiry. Then the returns desk: the withdrawal methods, the ceilings, the stated processing window and the point at which identity documents are demanded. A casino that prints all of it plainly ranks above one with a louder sale sign.',
  },
  {
    question: 'Do you actually play at these casinos?',
    answer:
      'No, and we will not print a figure we did not read somewhere you can read it too. The shop is a way of arranging what operators publish, not a claim to have bought anything. Everything here comes from pages the operator puts up itself — the promotion page, the bonus terms, the general terms, the cashier page and the regulator’s own register — quoted so it can be checked against the source. That is the method rather than a limitation of it: a site claiming its own deposits and withdrawals is asking to be believed about the one thing nobody else can check, where a published term is a matter of record anyone can go and look at.',
  },
  {
    question: 'Is a casino bonus actually free?',
    answer:
      'No, and that word is the whole problem. A bonus is a purchase and you pay for it three times over. You pay a deposit before it exists at all. You pay a wagering requirement — turning the bonus, and often the deposit with it, over a set number of times at a capped stake on a restricted list of games — before any of it is money you can take. And you pay a ceiling at the end, because most offers limit what may be withdrawn from bonus funds however well it went. None of those three is hidden; all three are published, usually on a page you have to go looking for. Calling the result "free" is not a lie, it is a missing price tag, and this site exists to print one.',
  },
  {
    question: 'Are the bonuses really worth it?',
    answer:
      'Sometimes, and the figure that decides it is never the one on the sale sign. Read four things first: the multiplier and what it is applied to, the maximum stake allowed while clearing, the cap on what may be withdrawn from the bonus, and how long you have. A headline of 100% up to €500 at 25x on the bonus and the same headline at 40x on deposit plus bonus are the same advertisement and roughly three times the cost. Those sit next to the offer here, quoted from where the operator published them — and where they are hard to find at all, treat the difficulty itself as information about the offer.',
  },
  {
    question: 'How quickly can I withdraw a win?',
    answer:
      'That depends on your method and your verification status, and we publish no timings of our own because we have measured none. What we do publish is the window the operator commits to in writing on its own cashier page, together with the ceilings it applies and the point at which it will ask for documents. That is a commitment you could hold it to, which is worth more before you deposit than any average we could quote.',
  },
  {
    question: 'Which casinos are licensed?',
    answer:
      'Every casino on the rail holds a gaming licence, and each review names the regulator so the claim can be checked on that authority’s own register rather than taken on trust. Check the countries as well: a licence is not the same thing as permission for you personally to hold an account, and the list an operator publishes of the places it accepts is the first thing read about it here.',
  },
  {
    question: 'Do you earn money from these links?',
    answer:
      'Yes. We may earn a commission when you register through a link on this site, and that is the price of the shop — it is what pays for the reading. It buys nothing else: the rail is ordered editorially, every casino is read against the same three checks, and no operator sees a ranking before you do. It is said here, and under the hero, and again under the three reads, because a site that argues prices should be printed on the front cannot keep its own on the back.',
  },
] as const
