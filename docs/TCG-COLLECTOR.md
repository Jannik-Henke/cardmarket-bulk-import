# The tcg-collector CSV contract

This fork's main consumer is [tcg-collector](https://github.com/Jannik-Henke/tcg-collector),
which generates the CSVs this extension imports. That side is the *producer*;
this document records what it relies on here, so a change in this repo that
breaks it is a deliberate one rather than a surprise on a live listing form.

## The header

`src/lib/cardmarket/bulk-import-csv.ts` emits:

```
name,number,price,condition,language,quantity,comment,foil
```

## Why those names

The extension does not require fixed column names — `ImportCsvForm` asks the
user to map each of its fields to a column. But `ColumnSelect.tsx` pre-selects
one by fuzzy-matching its **own property name** against the file's headers:

```ts
const fuse = new Fuse(options);          // options = the CSV's headers
const res = fuse.search(field.name);     // field.name = 'isFoil', 'price', …
field.onChange(res.at(0)?.item ?? '');   // best hit, or unmapped
```

The header above is chosen so that call maps every field with **no user input**:

| extension field | maps to  | note |
|-----------------|----------|------|
| `name`          | `name`   | |
| `language`      | `language` | |
| `condition`     | `condition` | |
| `comment`       | `comment` | carries the packing description |
| `quantity`      | `quantity` | always `1`; one CSV row per physical copy |
| `price`         | `price`  | EUR, two decimals |
| `isFoil`        | `foil`   | the one name that differs — Fuse bridges it |
| `isSigned`      | *(unmapped)* | no such column, and Fuse's default threshold correctly rejects every candidate |
| —               | `number` | **deliberately matched by nothing.** The collector number is internal: it stays readable when the file is eyeballed and out of the public ad. |

tcg-collector pins all of this in
`tests/lib/cardmarket/plugin-column-mapping.test.ts`, which runs the real
`fuse.js` (pinned to the version this repo resolves) against its own exported
header constant.

## What would break it

- **Renaming a field on `BaseColumnMapping`** (`game-manager/managers/generic.ts`).
  The property name *is* the search term, so `isFoil` → `foilFlag` changes what
  auto-maps.
- **Upgrading `fuse.js`** to a version whose ranking or default threshold
  differs. In particular, a looser threshold could start binding `isSigned` to
  a real column, which is worse than leaving it unbound: `parseRow` would run
  `parseBoolean(String(row[column]), ['signed'])` over unrelated data.
  The producer's test is pinned to one version and will **not** notice this —
  re-run a live import after any Fuse bump.
- **Changing `parseBoolean`'s truthy tokens** for foil. The CSV writes the
  literal `foil` (or an empty cell) to match `parseBoolean(cell, ['foil'])`.

## Foil

`a9b24db` made `fillRow` set the foil checkbox for every game rather than only
MTG, by querying `foilElSelector` from the resolved row and null-guarding it.
tcg-collector depends on that: it used to prefix the comment with `FOIL ` as a
workaround so the box could be ticked by hand, and that prefix has been removed
now that the fork ticks it. Reverting the foil commit would silently list every
foil copy as non-foil.

## Batching

Cardmarket's bulk form holds 100 articles and is **per expansion**.
tcg-collector chunks accordingly (`chunkByExpansion`) and offers one file per
chunk, so each downloaded CSV is meant to be imported into one expansion's form.
