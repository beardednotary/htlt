import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Tally, YearRecap } from './recap';

function rows(items: Tally[]): string {
  return items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.label)}</td><td class="count">${item.count}</td></tr>`
    )
    .join('');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function section(title: string, items: Tally[]): string {
  if (items.length === 0) return '';
  return `<h2>${title}</h2><table>${rows(items)}</table>`;
}

/**
 * A printable year. Deliberately plain — this is a keepsake and a record, not a
 * marketing asset, and it should still read well in black and white on paper.
 */
export function recapHtml(recap: YearRecap): string {
  const firsts =
    recap.firsts.length > 0
      ? `<h2>Firsts</h2><table>${recap.firsts
          .map(
            (first) =>
              `<tr><td>${escapeHtml(first.label)}</td><td class="count">${first.date}</td></tr>`
          )
          .join('')}</table>`
      : '';

  const places =
    recap.places.length > 0
      ? `<p class="places">${recap.places.map(escapeHtml).join(' · ')}</p>`
      : '';

  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", sans-serif; color: #111; margin: 48px; }
  h1 { font-size: 64px; margin: 0; letter-spacing: -2px; }
  .sub { color: #666; margin: 4px 0 32px; font-size: 15px; }
  .stats { display: flex; gap: 40px; margin-bottom: 8px; }
  .stat .n { font-size: 40px; font-weight: 600; }
  .stat .l { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  .places { color: #444; font-size: 15px; margin: 24px 0 0; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #666;
       margin: 32px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 16px; }
  td { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
  .count { text-align: right; color: #444; }
  footer { margin-top: 48px; color: #888; font-size: 12px; }
</style></head>
<body>
  <h1>${recap.year}</h1>
  <p class="sub">Hunting Tags &amp; License Tracker</p>

  <div class="stats">
    <div class="stat"><div class="n">${recap.daysAfield}</div><div class="l">Days afield</div></div>
    <div class="stat"><div class="n">${recap.harvests}</div><div class="l">Harvests</div></div>
    <div class="stat"><div class="n">${recap.fish}</div><div class="l">Fish</div></div>
    <div class="stat"><div class="n">${recap.hunts}</div><div class="l">Hunts</div></div>
    <div class="stat"><div class="n">${recap.fishingTrips}</div><div class="l">Trips</div></div>
  </div>
  ${places}

  ${firsts}
  ${section('Species', recap.species)}
  ${section('Method', recap.methods)}
  ${section('With', recap.companions)}

  <footer>
    ${recap.blankHunts} of ${recap.hunts} hunts ended without a harvest.
    ${recap.busiestMonth ? `Busiest month: ${recap.busiestMonth}.` : ''}
  </footer>
</body>
</html>`;
}

export async function shareRecap(recap: YearRecap): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: recapHtml(recap) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `${recap.year} Season Recap`,
    });
  }
}
