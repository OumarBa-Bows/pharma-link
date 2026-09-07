import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface CommandPdfLine {
  name: string;
  reference: string;
  quantity: number;
  unitPrice: number;
  /** Remise appliquée en pourcentage, 0 si aucune */
  discount: number;
  total: number;
}

export interface CommandPdfData {
  code: string;
  date: string | Date;
  /** Libellé du statut déjà traduit */
  status: string;
  pharmacyName: string;
  pharmacyCode: string;
  pharmacyPhone: string;
  lines: CommandPdfLine[];
}

const CURRENCY = 'MRU';
const FONT_WAIT_MS = 1500;
const CLEANUP_FALLBACK_MS = 60000;

/**
 * Génère le bon de commande en ouvrant la boîte d'impression du navigateur
 * sur un document HTML dédié (« Enregistrer en PDF »).
 * Le document est rendu dans une iframe cachée : pas de nouvel onglet,
 * donc pas de blocage par le bloqueur de pop-ups.
 */
@Injectable({ providedIn: 'root' })
export class CommandPdfService {
  private translateService = inject(TranslateService);

  /** Retourne false si l'impression n'a pas pu être lancée. */
  print(data: CommandPdfData): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument;
    const frameWin = iframe.contentWindow;
    if (!frameDoc || !frameWin) {
      iframe.remove();
      return false;
    }

    frameDoc.open();
    frameDoc.write(this.buildDocument(data));
    frameDoc.close();

    let removed = false;
    const cleanup = () => {
      if (removed) return;
      removed = true;
      iframe.remove();
    };

    frameWin.addEventListener('afterprint', cleanup);
    // Filet de sécurité : certains navigateurs n'émettent pas afterprint dans une iframe.
    setTimeout(cleanup, CLEANUP_FALLBACK_MS);

    // Attendre les polices pour éviter d'imprimer avec la police de repli.
    const fontsReady: Promise<unknown> = frameDoc.fonts ? frameDoc.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS))]).then(() => {
      if (removed) return;
      frameWin.focus();
      frameWin.print();
    });

    return true;
  }

  // ---------------------------------------------------------------- rendu

  private buildDocument(data: CommandPdfData): string {
    const t = (key: string, params?: object) => this.translateService.instant(`commands.details.pdf.${key}`, params);
    const label = (key: string) => this.translateService.instant(key);

    const lang = this.translateService.getCurrentLang() || this.translateService.defaultLang || 'fr';
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    const grossSubtotal = data.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const netTotal = data.lines.reduce((sum, line) => sum + line.total, 0);
    const discountsTotal = grossSubtotal - netTotal;

    const issuedAt = this.formatDate(new Date());
    // Chrome propose le titre du document comme nom de fichier PDF.
    const docTitle = `${t('docTitle')} ${data.code}`;

    return `<!doctype html>
<html lang="${this.escape(lang)}" dir="${dir}">
<head>
<meta charset="utf-8">
<title>${this.escape(docTitle)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>${this.styles()}</style>
</head>
<body>
<div class="sheet">

  <header class="masthead">
    <div class="brand">
      <span class="brand-mark">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 7v10M7 12h10"></path>
          <rect x="3" y="3" width="18" height="18" rx="5"></rect>
        </svg>
      </span>
      <span>
        <span class="brand-name">${this.escape(label('app-name'))}</span>
        <span class="brand-sub">${this.escape(t('brandSub'))}</span>
      </span>
    </div>
    <div class="doc-id">
      <div class="doc-type">${this.escape(t('docTitle'))}</div>
      <div class="doc-code">${this.escape(data.code)}</div>
      <div class="doc-date">${this.escape(t('issuedOn', { date: this.formatDate(data.date) }))}</div>
    </div>
  </header>

  <section class="strip">
    <div class="strip-col">
      <div class="block-label">${this.escape(label('commands.details.pharmacy'))}</div>
      <div class="client-name">${this.escape(data.pharmacyName)}</div>
      <div class="client-line">${this.escape(label('pharmacies.code'))} : ${this.escape(data.pharmacyCode)}</div>
      <div class="client-line">${this.escape(data.pharmacyPhone)}</div>
    </div>
    <div class="strip-col">
      <div class="block-label">${this.escape(t('orderBlock'))}</div>
      <dl class="facts">
        <dt>${this.escape(label('commands.details.status'))}</dt>
        <dd><span class="status">${this.escape(data.status)}</span></dd>
        <dt>${this.escape(label('commands.details.date'))}</dt>
        <dd>${this.escape(this.formatDate(data.date))}</dd>
        <dt>${this.escape(t('references'))}</dt>
        <dd>${this.escape(t('articlesCount', { count: data.lines.length }))}</dd>
        <dt>${this.escape(t('currency'))}</dt>
        <dd>${CURRENCY}</dd>
      </dl>
    </div>
  </section>

  <div class="table-head">
    <h2>${this.escape(label('commands.details.article.title'))}</h2>
    <span>${this.escape(label('commands.details.nombre'))}${data.lines.length}</span>
  </div>

  ${data.lines.length ? this.renderTable(data.lines) : `<p class="empty">${this.escape(label('commands.details.article.noArticle'))}</p>`}

  <div class="totals-row">
    <dl class="totals">
      <dt>${this.escape(t('subtotal'))}</dt>
      <dd>${this.formatAmount(grossSubtotal)}</dd>
      <dt>${this.escape(t('discountsTotal'))}</dt>
      <dd>${discountsTotal > 0 ? '&minus;&nbsp;' : ''}${this.formatAmount(discountsTotal)}</dd>
      <div class="sep"></div>
      <dt class="grand-dt">${this.escape(t('grandTotal'))}</dt>
      <dd class="grand-dd">${this.formatAmount(netTotal)}</dd>
    </dl>
  </div>

  <footer class="sheet-foot">
    ${this.escape(t('footerNote', { date: issuedAt }))}<br>
    ${this.escape(t('footerDisclaimer'))}
  </footer>

</div>
</body>
</html>`;
  }

  private renderTable(lines: CommandPdfLine[]): string {
    const label = (key: string) => this.translateService.instant(key);

    const rows = lines
      .map(
        (line) => `<tr>
        <td class="art">${this.escape(line.name)}</td>
        <td class="ref">${this.escape(line.reference)}</td>
        <td class="mid">${line.quantity}</td>
        <td class="num">${this.formatNumber(line.unitPrice)}</td>
        <td class="mid">${line.discount > 0 ? `<span class="rem">${this.formatPercent(line.discount)}</span>` : '<span class="dash">&mdash;</span>'}</td>
        <td class="num line-total">${this.formatNumber(line.total)}</td>
      </tr>`
      )
      .join('\n');

    return `<table>
    <thead>
      <tr>
        <th>${this.escape(label('commands.details.article.article'))}</th>
        <th>${this.escape(label('commands.details.reference'))}</th>
        <th class="mid">${this.escape(label('commands.details.article.quantity'))}</th>
        <th class="num">${this.escape(label('commands.details.article.unitPrice'))}</th>
        <th class="mid">${this.escape(label('commands.details.remise'))}</th>
        <th class="num">${this.escape(label('commands.details.article.total'))}</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>`;
  }

  // ---------------------------------------------------------------- format

  private get locale(): string {
    switch (this.translateService.getCurrentLang() || this.translateService.defaultLang) {
      case 'ar':
        return 'ar-MA'; // chiffres latins, séparateurs maghrébins
      case 'en':
        return 'en-US';
      default:
        return 'fr-FR';
    }
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  private formatAmount(value: number): string {
    return `${this.formatNumber(value)}&nbsp;${CURRENCY}`;
  }

  private formatPercent(value: number): string {
    return new Intl.NumberFormat(this.locale, { style: 'percent', maximumFractionDigits: 2 }).format(value / 100);
  }

  /** Même format que l'écran de détail : dd/MM/yyyy HH:mm */
  private formatDate(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private escape(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  private styles(): string {
    return `
    @page { size: A4; margin: 14mm 14mm 12mm; }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #17172b;
      font-family: 'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .sheet { display: flow-root; }

    .masthead {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 14px;
      border-bottom: 2px solid #17172b;
    }

    .brand { display: flex; align-items: center; gap: 10px; }

    .brand-mark {
      width: 34px; height: 34px; flex: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      display: inline-flex; align-items: center; justify-content: center;
    }

    .brand-name { display: block; font-size: 15pt; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
    .brand-sub {
      display: block; margin-top: 2px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 7pt; letter-spacing: 0.14em; text-transform: uppercase; color: #7a7a92;
    }

    .doc-id { text-align: end; }
    .doc-type { font-size: 11.5pt; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
    .doc-code { font-family: 'IBM Plex Mono', monospace; font-size: 15pt; font-weight: 600; margin-top: 2px; }
    .doc-date { font-size: 8.5pt; color: #7a7a92; margin-top: 2px; font-variant-numeric: tabular-nums; }

    .strip {
      display: flex;
      border-bottom: 1px solid #e2e2ee;
    }
    .strip-col { flex: 1; padding: 16px 0; }
    .strip-col + .strip-col { padding-inline-start: 24px; border-inline-start: 1px solid #e2e2ee; }

    .block-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 7pt; letter-spacing: 0.14em; text-transform: uppercase; color: #7a7a92;
      margin-bottom: 6px;
    }

    .client-name { font-size: 11.5pt; font-weight: 600; letter-spacing: -0.01em; }
    .client-line { font-size: 9pt; color: #4a4a63; margin-top: 2px; font-variant-numeric: tabular-nums; }

    .facts { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; margin: 0; font-size: 9pt; }
    .facts dt { color: #7a7a92; }
    .facts dd { margin: 0; font-weight: 500; font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

    .status {
      display: inline-block;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 8pt; font-weight: 600;
      padding: 1px 7px; border-radius: 3px;
      background: #e4f3ec; color: #1f7a5c;
    }

    .table-head { display: flex; align-items: baseline; justify-content: space-between; margin: 20px 0 8px; }
    .table-head h2 { margin: 0; font-size: 10pt; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
    .table-head span { font-size: 8.5pt; color: #7a7a92; font-variant-numeric: tabular-nums; }

    table { width: 100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }

    thead th {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 6.5pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #7a7a92;
      text-align: start; padding: 0 6px 6px; border-bottom: 1px solid #c6c5da; white-space: nowrap;
    }
    tbody td { padding: 7px 6px; border-bottom: 1px solid #e2e2ee; vertical-align: top; font-size: 9pt; }
    tbody tr:nth-child(even) td { background: #f7f7fb; }
    thead th:first-child, tbody td:first-child { padding-inline-start: 0; }
    thead th:last-child, tbody td:last-child { padding-inline-end: 0; }

    .num { text-align: end; font-variant-numeric: tabular-nums; font-family: 'IBM Plex Mono', monospace; }
    .mid { text-align: center; font-variant-numeric: tabular-nums; font-family: 'IBM Plex Mono', monospace; }
    .art { font-weight: 500; }
    .ref { font-family: 'IBM Plex Mono', monospace; font-size: 8.5pt; color: #4a4a63; }
    .line-total { font-weight: 600; }
    .dash { color: #7a7a92; }

    .rem {
      display: inline-block;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 8pt; font-weight: 500;
      padding: 0 5px; border-radius: 3px;
      background: #fbeee0; color: #a8571b;
    }

    .empty {
      margin: 18px 0;
      padding: 20px;
      border: 1px dashed #c6c5da;
      text-align: center;
      color: #7a7a92;
      font-size: 9.5pt;
    }

    .totals-row { display: flex; justify-content: flex-end; margin-top: 18px; break-inside: avoid; page-break-inside: avoid; }
    .totals { width: 74mm; display: grid; grid-template-columns: 1fr auto; gap: 7px 20px; margin: 0; font-size: 9.5pt; }
    .totals dt { color: #4a4a63; }
    .totals dd { margin: 0; text-align: end; font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
    .totals .sep { grid-column: 1 / -1; height: 1px; background: #17172b; margin-top: 2px; }
    .totals .grand-dt { font-size: 10.5pt; font-weight: 600; color: #17172b; align-self: center; }
    .totals .grand-dd { font-size: 13pt; font-weight: 600; }

    .sheet-foot {
      margin-top: 26px;
      padding-top: 12px;
      border-top: 1px solid #e2e2ee;
      font-size: 7.5pt;
      color: #7a7a92;
      line-height: 1.5;
    }
    `;
  }
}
