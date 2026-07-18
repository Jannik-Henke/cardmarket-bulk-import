import memoize from 'memoize';

function getWebsiteRowsImpl() {
  return [...document.querySelectorAll('td div.col-product.text-start a').values()];
}

export const getWebsiteRows = memoize(getWebsiteRowsImpl);

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
