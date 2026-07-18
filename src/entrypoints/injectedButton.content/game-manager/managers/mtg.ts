import memoize from 'memoize';
import { sendMessage } from 'webext-bridge/content-script';
import * as yup from 'yup';

import GenericGameManager from './generic';
import type { BaseColumnMapping } from './generic';
import { compareNormalized } from '../../../../utils';
import type { TranslationKey } from '../../../../utils';

async function getMTGJSONDataImpl() {
  // We can't fetch inside the content script, so we delegate to the background with messages
  return sendMessage('cardmarket-bulk-import.getMTGJSONData', undefined, 'background');
}

const getMTGJSONData = memoize(getMTGJSONDataImpl);

async function matchSetToCardmarketIdImpl(set: string) {
  const sets = await getMTGJSONData();
  const result = sets.find(({ matchKeys }) => !!matchKeys.find((v) => compareNormalized(v, set)));
  if (result) return { code: result.code, cardmarketId: result.cardmarketId };
  return null;
}

const matchSetToCardmarketId = memoize(matchSetToCardmarketIdImpl);

// Foil is handled generically by GenericGameManager (the `isFoil` base column
// fills the same `input[name^="isFoil"]` checkbox on every game that has it),
// so MTG only needs to add its own `set` column here.
class MtgGameManager extends GenericGameManager<'set', { set: string }> {
  extraColumns: Record<'set', TranslationKey> = {
    set: 'injectedButton.gameManagers.mtg.importCsvForm.set.label',
  };

  extraValidationSchema = yup.object({
    set: yup.string(),
  });

  async parseRow(
    id: number,
    rawRowData: Record<string, unknown>,
    columnMapping: BaseColumnMapping & { set: string | undefined },
  ) {
    const parsedData = await super.parseRow(id, rawRowData, columnMapping);
    let set = columnMapping['set'] ? String(rawRowData[columnMapping['set']]) : '';
    let enabled = parsedData.enabled;
    if (set) {
      const paramsCode = Number(new URLSearchParams(window.location.search).get('idExpansion'));
      const data = await matchSetToCardmarketId(set);
      if (data) {
        set = data.code;
        if (data.cardmarketId !== paramsCode) enabled = false;
      }
      else {
        set = '';
      }
    }
    return {
      ...parsedData,
      set: set,
      enabled,
    };
  }

  extraTableColumns: Record<'set', TranslationKey> = {
    set: 'injectedButton.gameManagers.mtg.selectRowsFormTable.set',
  };
};

export default MtgGameManager;
