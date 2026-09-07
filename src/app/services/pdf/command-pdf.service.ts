import { inject, Injectable } from '@angular/core';
import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import type { jsPDF } from 'jspdf';

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
  /** Statut brut renvoyé par l'API (ex. VALIDATED) ; traduit dans la langue du document. */
  status: string;
  pharmacyName: string;
  pharmacyCode: string;
  pharmacyPhone: string;
  lines: CommandPdfLine[];
}

export interface CommandPdfResult {
  generated: boolean;
  /** Langue réellement employée dans le document. */
  documentLang: string;
  /** true si la langue de l'interface n'a pas pu être utilisée. */
  languageFallback: boolean;
}

const CURRENCY = 'MRU';

/**
 * Les polices standard du PDF (Helvetica, Courier) sont encodées en WinAnsi :
 * elles ne portent aucun glyphe arabe. Un document en arabe sortirait illisible,
 * on le produit donc en français.
 */
const PDF_SAFE_LANGS = ['fr', 'en'];
const PDF_FALLBACK_LANG = 'fr';

// A4 portrait, en millimètres.
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 14;
const RIGHT_EDGE = PAGE_WIDTH - MARGIN_X;
const TABLE_TOP_CONTINUED = 26;
const TABLE_BOTTOM = 24;

const COLORS = {
  ink: [23, 23, 43],
  inkSoft: [74, 74, 99],
  inkMuted: [122, 122, 146],
  rule: [226, 226, 238],
  ruleStrong: [198, 197, 218],
  zebra: [247, 247, 251],
  brand: [102, 126, 234],
  white: [255, 255, 255],
  okText: [31, 122, 92],
  okFill: [228, 243, 236],
  warnText: [168, 87, 27],
  warnFill: [251, 238, 224]
} as const;

const COLUMN_WIDTHS = { name: 62, reference: 32, quantity: 18, unitPrice: 26, discount: 18, total: 26 };
const DISCOUNT_COLUMN = 4;

type Rgb = readonly [number, number, number];
type Translator = (key: string, params?: Record<string, unknown>) => string;

interface RenderContext {
  doc: jsPDF;
  data: CommandPdfData;
  issuedAt: string;
  locale: string;
  /** Clés relatives à commands.details.pdf */
  t: Translator;
  /** Clés absolues, partagées avec l'écran de détail */
  label: Translator;
}

/**
 * Génère le bon de commande sous forme de fichier PDF téléchargé.
 * jsPDF est chargé à la demande : il ne pèse sur le bundle initial que
 * lorsque l'utilisateur clique effectivement sur le bouton.
 */
@Injectable({ providedIn: 'root' })
export class CommandPdfService {
  private translateService = inject(TranslateService);
  private translateLoader = inject(TranslateLoader);
  private fallbackDictionary?: Record<string, unknown>;

  async generate(data: CommandPdfData): Promise<CommandPdfResult> {
    const uiLang = this.currentLang;
    const documentLang = PDF_SAFE_LANGS.includes(uiLang) ? uiLang : PDF_FALLBACK_LANG;
    const languageFallback = documentLang !== uiLang;

    if (typeof window === 'undefined') {
      return { generated: false, documentLang, languageFallback };
    }

    const label = await this.translatorFor(documentLang);
    const t: Translator = (key, params) => label(`commands.details.pdf.${key}`, params);

    const [{ jsPDF: JsPdf }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const doc = new JsPdf({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

    const ctx: RenderContext = {
      doc,
      data,
      issuedAt: this.formatDate(new Date()),
      locale: this.localeFor(documentLang),
      t,
      label
    };

    doc.setProperties({
      title: this.documentName(ctx),
      subject: `${t('docTitle')} ${data.code}`,
      author: label('app-name'),
      creator: label('app-name')
    });

    this.drawMasthead(ctx);
    const stripBottom = this.drawStrip(ctx);
    const tableTop = this.drawTableHeading(ctx, stripBottom);

    autoTable(doc, {
      startY: tableTop,
      margin: { top: TABLE_TOP_CONTINUED, left: MARGIN_X, right: MARGIN_X, bottom: TABLE_BOTTOM },
      head: [this.tableHead(ctx)],
      body: this.tableBody(ctx),
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 1.6, right: 1.6 }, textColor: [...COLORS.ink] },
      headStyles: {
        fontSize: 6.4,
        fontStyle: 'bold',
        textColor: [...COLORS.inkMuted],
        lineColor: [...COLORS.ruleStrong],
        lineWidth: { bottom: 0.35, top: 0, left: 0, right: 0 },
        cellPadding: { top: 0, bottom: 1.8, left: 1.6, right: 1.6 }
      },
      bodyStyles: { lineColor: [...COLORS.rule], lineWidth: { bottom: 0.15, top: 0, left: 0, right: 0 } },
      alternateRowStyles: { fillColor: [...COLORS.zebra] },
      columnStyles: {
        0: { cellWidth: COLUMN_WIDTHS.name, fontStyle: 'bold' },
        1: { cellWidth: COLUMN_WIDTHS.reference, font: 'courier', fontSize: 7.5, textColor: [...COLORS.inkSoft] },
        2: { cellWidth: COLUMN_WIDTHS.quantity, halign: 'center' },
        3: { cellWidth: COLUMN_WIDTHS.unitPrice, halign: 'right' },
        4: { cellWidth: COLUMN_WIDTHS.discount, halign: 'center', fontSize: 7.5 },
        5: { cellWidth: COLUMN_WIDTHS.total, halign: 'right', fontStyle: 'bold' }
      },
      // Pastille orangée derrière le pourcentage de remise.
      willDrawCell: (cell) => {
        if (cell.section !== 'body' || cell.column.index !== DISCOUNT_COLUMN) {
          return;
        }
        const text = cell.cell.text[0];
        if (!text || text === '-') {
          this.setTextColor(doc, COLORS.inkMuted);
          return;
        }
        this.setTextColor(doc, COLORS.warnText);
        const width = doc.getTextWidth(text) + 2.4;
        const height = 4;
        this.setFillColor(doc, COLORS.warnFill);
        doc.roundedRect(
          cell.cell.x + cell.cell.width / 2 - width / 2,
          cell.cell.y + cell.cell.height / 2 - height / 2,
          width,
          height,
          0.9,
          0.9,
          'F'
        );
      },
      didDrawPage: (hook) => {
        if (hook.pageNumber > 1) {
          this.drawContinuedHeader(ctx);
        }
        this.drawFooter(ctx);
      }
    });

    const tableEnd = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? tableTop;
    this.drawTotals(ctx, tableEnd);
    this.stampPageNumbers(ctx);

    doc.save(`${this.documentName(ctx)}.pdf`);
    return { generated: true, documentLang, languageFallback };
  }

  // ------------------------------------------------------------ composition

  private drawMasthead(ctx: RenderContext): void {
    const { doc, data, t, label } = ctx;

    this.setFillColor(doc, COLORS.brand);
    doc.roundedRect(MARGIN_X, 13, 12, 12, 2.6, 2.6, 'F');

    // Croix pharmaceutique, en blanc sur le carré de marque.
    this.setDrawColor(doc, COLORS.white);
    doc.setLineWidth(1.1);
    doc.line(MARGIN_X + 6, 16.6, MARGIN_X + 6, 21.4);
    doc.line(MARGIN_X + 3.6, 19, MARGIN_X + 8.4, 19);

    const textLeft = MARGIN_X + 15.5;
    this.setTextColor(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold').setFontSize(16);
    doc.text(label('app-name'), textLeft, 19.6);

    this.setTextColor(doc, COLORS.inkMuted);
    doc.setFont('helvetica', 'normal').setFontSize(6.4).setCharSpace(0.55);
    doc.text(t('brandSub').toUpperCase(), textLeft, 24);
    doc.setCharSpace(0);

    this.setTextColor(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold').setFontSize(10.5).setCharSpace(0.4);
    doc.text(t('docTitle').toUpperCase(), RIGHT_EDGE, 17.6, { align: 'right' });
    doc.setCharSpace(0);

    doc.setFont('courier', 'bold').setFontSize(15);
    doc.text(data.code, RIGHT_EDGE, 24.2, { align: 'right' });

    this.setTextColor(doc, COLORS.inkMuted);
    doc.setFont('helvetica', 'normal').setFontSize(7.5);
    doc.text(t('issuedOn', { date: this.formatDate(data.date) }), RIGHT_EDGE, 28.6, { align: 'right' });

    this.setDrawColor(doc, COLORS.ink);
    doc.setLineWidth(0.6);
    doc.line(MARGIN_X, 32, RIGHT_EDGE, 32);
  }

  /** Bloc client / commande. Retourne l'ordonnée du bas du bloc. */
  private drawStrip(ctx: RenderContext): number {
    const { doc, data, t, label } = ctx;
    const splitX = MARGIN_X + 98;
    const rightX = splitX + 8;
    const valueX = rightX + 26;

    this.drawLabel(doc, label('commands.details.pharmacy'), MARGIN_X, 39);

    this.setTextColor(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold').setFontSize(11.5);
    doc.text(data.pharmacyName ?? '', MARGIN_X, 45.4);

    this.setTextColor(doc, COLORS.inkSoft);
    doc.setFont('helvetica', 'normal').setFontSize(8.5);
    doc.text(`${label('pharmacies.code')} : ${data.pharmacyCode ?? ''}`, MARGIN_X, 50.4);
    doc.text(data.pharmacyPhone ?? '', MARGIN_X, 54.8);

    this.setDrawColor(doc, COLORS.rule);
    doc.setLineWidth(0.2);
    doc.line(splitX, 35, splitX, 60);

    this.drawLabel(doc, t('orderBlock'), rightX, 39);

    // Le statut est une pastille, il est dessiné à part.
    this.setTextColor(doc, COLORS.inkMuted);
    doc.setFont('helvetica', 'normal').setFontSize(8.5);
    doc.text(label('commands.details.status'), rightX, 45.4);
    this.drawBadge(doc, label(`commands.status.${(data.status ?? '').toLowerCase()}`), valueX, 45.4, COLORS.okFill, COLORS.okText);

    const facts: [string, string][] = [
      [label('commands.details.date'), this.formatDate(data.date)],
      [t('references'), t('articlesCount', { count: data.lines.length })],
      [t('currency'), CURRENCY]
    ];

    facts.forEach(([term, value], index) => {
      const y = 50.4 + index * 4.6;
      this.setTextColor(doc, COLORS.inkMuted);
      doc.setFont('helvetica', 'normal').setFontSize(8.5);
      doc.text(term, rightX, y);
      this.setTextColor(doc, COLORS.ink);
      doc.setFont('helvetica', 'bold').setFontSize(8.5);
      doc.text(value, valueX, y);
    });

    this.setDrawColor(doc, COLORS.rule);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, 63, RIGHT_EDGE, 63);

    return 63;
  }

  private drawTableHeading(ctx: RenderContext, top: number): number {
    const { doc, data, label } = ctx;
    const baseline = top + 7.5;

    this.setTextColor(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold').setFontSize(9.5).setCharSpace(0.35);
    doc.text(label('commands.details.article.title').toUpperCase(), MARGIN_X, baseline);
    doc.setCharSpace(0);

    this.setTextColor(doc, COLORS.inkMuted);
    doc.setFont('helvetica', 'normal').setFontSize(8);
    doc.text(`${label('commands.details.nombre')}${data.lines.length}`, RIGHT_EDGE, baseline, { align: 'right' });

    return baseline + 3.5;
  }

  private tableHead({ label }: RenderContext): string[] {
    return [
      label('commands.details.article.article').toUpperCase(),
      label('commands.details.reference').toUpperCase(),
      label('commands.details.article.quantity').toUpperCase(),
      label('commands.details.article.unitPrice').toUpperCase(),
      label('commands.details.remise').toUpperCase(),
      label('commands.details.article.total').toUpperCase()
    ];
  }

  private tableBody(ctx: RenderContext): string[][] {
    return ctx.data.lines.map((line) => [
      line.name ?? '',
      line.reference ?? '',
      String(line.quantity),
      this.formatNumber(line.unitPrice, ctx.locale),
      line.discount > 0 ? this.formatPercent(line.discount, ctx.locale) : '-',
      this.formatNumber(line.total, ctx.locale)
    ]);
  }

  private drawTotals(ctx: RenderContext, tableEnd: number): void {
    const { doc, data, t } = ctx;

    const gross = data.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const net = data.lines.reduce((sum, line) => sum + line.total, 0);
    const discounts = gross - net;

    const blockHeight = 24;
    let top = tableEnd + 8;
    if (top + blockHeight > PAGE_HEIGHT - TABLE_BOTTOM) {
      doc.addPage();
      this.drawContinuedHeader(ctx);
      this.drawFooter(ctx);
      top = TABLE_TOP_CONTINUED;
    }

    const labelX = RIGHT_EDGE - 74;

    doc.setFont('helvetica', 'normal').setFontSize(8.8);
    this.setTextColor(doc, COLORS.inkSoft);
    doc.text(t('subtotal'), labelX, top);
    doc.text(t('discountsTotal'), labelX, top + 5.2);

    this.setTextColor(doc, COLORS.ink);
    doc.text(this.formatAmount(gross, ctx.locale), RIGHT_EDGE, top, { align: 'right' });
    doc.text(`${discounts > 0 ? '- ' : ''}${this.formatAmount(discounts, ctx.locale)}`, RIGHT_EDGE, top + 5.2, { align: 'right' });

    this.setDrawColor(doc, COLORS.ink);
    doc.setLineWidth(0.35);
    doc.line(labelX, top + 8.6, RIGHT_EDGE, top + 8.6);

    doc.setFont('helvetica', 'bold').setFontSize(10);
    doc.text(t('grandTotal'), labelX, top + 15.2);
    doc.setFontSize(13);
    doc.text(this.formatAmount(net, ctx.locale), RIGHT_EDGE, top + 15.6, { align: 'right' });
  }

  private drawContinuedHeader({ doc, data, t }: RenderContext): void {
    this.setTextColor(doc, COLORS.inkMuted);
    doc.setFont('helvetica', 'bold').setFontSize(8);
    doc.text(`${t('docTitle')} — ${data.code}`, MARGIN_X, 16);

    this.setDrawColor(doc, COLORS.rule);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, 19, RIGHT_EDGE, 19);
  }

  private drawFooter({ doc, t, issuedAt }: RenderContext): void {
    const top = PAGE_HEIGHT - 17;

    this.setDrawColor(doc, COLORS.rule);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, top, RIGHT_EDGE, top);

    this.setTextColor(doc, COLORS.inkMuted);
    doc.setFont('helvetica', 'normal').setFontSize(6.6);
    doc.text(t('footerNote', { date: issuedAt }), MARGIN_X, top + 4);
    doc.text(t('footerDisclaimer'), MARGIN_X, top + 7.2);
  }

  /** Le nombre total de pages n'est connu qu'une fois le tableau paginé. */
  private stampPageNumbers({ doc, t }: RenderContext): void {
    const total = doc.getNumberOfPages();
    for (let page = 1; page <= total; page++) {
      doc.setPage(page);
      this.setTextColor(doc, COLORS.inkMuted);
      doc.setFont('helvetica', 'normal').setFontSize(6.6);
      doc.text(t('page', { current: page, total }), RIGHT_EDGE, PAGE_HEIGHT - 13, { align: 'right' });
    }
  }

  // ------------------------------------------------------------- primitives

  private drawLabel(doc: jsPDF, text: string, x: number, y: number): void {
    this.setTextColor(doc, COLORS.inkMuted);
    doc.setFont('helvetica', 'normal').setFontSize(6.4).setCharSpace(0.55);
    doc.text(text.toUpperCase(), x, y);
    doc.setCharSpace(0);
  }

  private drawBadge(doc: jsPDF, text: string, x: number, baseline: number, fill: Rgb, color: Rgb): void {
    doc.setFont('helvetica', 'bold').setFontSize(8);
    const width = doc.getTextWidth(text) + 4;
    this.setFillColor(doc, fill);
    doc.roundedRect(x, baseline - 3.2, width, 4.6, 0.9, 0.9, 'F');
    this.setTextColor(doc, color);
    doc.text(text, x + 2, baseline);
  }

  private setTextColor(doc: jsPDF, [r, g, b]: Rgb): void {
    doc.setTextColor(r, g, b);
  }

  private setFillColor(doc: jsPDF, [r, g, b]: Rgb): void {
    doc.setFillColor(r, g, b);
  }

  private setDrawColor(doc: jsPDF, [r, g, b]: Rgb): void {
    doc.setDrawColor(r, g, b);
  }

  // ---------------------------------------------------------------- i18n

  private get currentLang(): string {
    return this.translateService.getCurrentLang() || this.translateService.defaultLang || PDF_FALLBACK_LANG;
  }

  /**
   * TranslateService.instant ne lit que la langue courante. Quand le document
   * doit sortir dans une autre langue, on charge son dictionnaire directement.
   */
  private async translatorFor(documentLang: string): Promise<Translator> {
    if (documentLang === this.currentLang) {
      return (key, params) => this.translateService.instant(key, params);
    }

    if (!this.fallbackDictionary) {
      this.fallbackDictionary = (await firstValueFrom(this.translateLoader.getTranslation(documentLang))) as Record<string, unknown>;
    }

    const dictionary = this.fallbackDictionary;
    return (key, params) => {
      const value = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], dictionary);
      if (typeof value !== 'string') {
        return key;
      }
      return params ? value.replace(/{{\s*(\w+)\s*}}/g, (match, name) => (name in params ? String(params[name]) : match)) : value;
    };
  }

  private documentName(ctx: RenderContext): string {
    // Caractères interdits dans un nom de fichier sous Windows et macOS.
    return `${ctx.t('docTitle')} ${ctx.data.code}`.replace(/[\\/:*?"<>|]/g, '-').trim();
  }

  // -------------------------------------------------------------- formats

  private localeFor(documentLang: string): string {
    return documentLang === 'en' ? 'en-US' : 'fr-FR';
  }

  /**
   * Les polices standard du PDF sont encodées en WinAnsi : elles ignorent
   * l'espace fine insécable qu'Intl utilise comme séparateur de milliers en
   * français, ainsi que le signe moins typographique. On les ramène en ASCII.
   */
  private toWinAnsi(value: string): string {
    return value.replace(/[  ]/g, ' ').replace(/−/g, '-');
  }

  private formatNumber(value: number, locale: string): string {
    return this.toWinAnsi(new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value));
  }

  private formatAmount(value: number, locale: string): string {
    return `${this.formatNumber(value, locale)} ${CURRENCY}`;
  }

  private formatPercent(value: number, locale: string): string {
    return this.toWinAnsi(new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 }).format(value / 100));
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
}
