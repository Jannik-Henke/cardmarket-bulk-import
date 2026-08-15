/**
 * The product-name anchors of every row Cardmarket is CURRENTLY showing.
 *
 * NOT MEMOIZED, and that is the fix rather than an oversight. It used to be
 * `memoize(getWebsiteRowsImpl)`, and because the function takes no arguments,
 * memoize's default cache key (`arguments_[0]`) is always `undefined` — one
 * cache entry for the entire life of the page. The bulk form re-renders its
 * table whenever you change the expansion or the filters, so the cached list
 * went stale the first time you narrowed it: a second import matched your CSV
 * against the rows that happened to be on screen during the first one, and
 * every genuinely-present card came back unmatched and greyed out.
 *
 * The cost of dropping it is one `querySelectorAll` per `matchName` call
 * (i.e. per CSV row). That is a sub-millisecond query over a table the form
 * caps at 100 rows; the per-row string normalisation this feeds was always the
 * expensive part, and it is unchanged.
 */
export function getWebsiteRows() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

// Selectors for the fields from the tr Element for each row
export const languageElSelector = 'td select[name^="idLanguage"]';
export const conditionElSelector = 'td select[name^="idCondition"]';
export const signedElSelector = 'td input[name^="isSigned"]';
// Foil checkbox — present on every game whose Bulk Listing rows support foil
// (MTG, Lorcana, Star Wars: Unlimited, …); absent on games without it, so
// callers must null-guard the lookup.
export const foilElSelector = 'td input[name^="isFoil"]';
export const commentElSelector = 'td input[name^="comments"]';
export const quantityElSelector = 'td input[name^="amount"]';
export const priceElSelector = 'td input[name^="price"]';
