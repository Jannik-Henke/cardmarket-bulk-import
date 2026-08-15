import { defineContentScript, createIntegratedUi } from '#imports';

import ReactDOM from 'react-dom/client';

import App from './App';

export default defineContentScript({
  matches: ['*://*.cardmarket.com/*/*/Stock/ListingMethods/BulkListing*'],
  main: (ctx) => {
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'div#BulkAccordion',
      append: 'after',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });
    // NOT `{ once: true }`. The anchor is `div#BulkAccordion`, which does not
    // exist until the bulk form has a table to show — so the button correctly
    // appears only once you have picked an expansion. But `once` means that
    // when the anchor DISAPPEARS, wxt unmounts the UI and then calls
    // `stopAutoMount()`, aborting the observer for good
    // (wxt/dist/utils/content-script-ui/shared.mjs). Cardmarket re-renders that
    // accordion when you change the expansion or the filters, so the import
    // button vanished on the first such change and only a page reload brought
    // it back. Without `once`, the observer keeps watching and the UI
    // re-mounts each time the form comes back.
    ui.autoMount();
  },
});
