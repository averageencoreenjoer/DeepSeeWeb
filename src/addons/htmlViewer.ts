import {Component, DoCheck, inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {BaseWidget} from "../app/components/widgets/base-widget.class";
import {IAddonInfo, IMDXData} from "../app/services/dsw.types";

@Component({
  standalone: true,
  template: `
    <div class="html-viewer" [innerHTML]="markup"></div>`,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
    }

    .html-viewer {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  `]
})
export class HtmlViewer extends BaseWidget implements OnInit, DoCheck, OnDestroy {
  static AddonInfo: IAddonInfo = {
    // Version of addon system, should be specified manually as number, not reference
    // version always should be equal to BaseWidget.CURRENT_ADDON_VERSION
    // used to compare unsupported addons when breaking changes are made into BaseWidget
    // Note: do not use reference to BaseWidget.CURRENT_ADDON_VERSIO here!
    // specify number MANUALLY
    version: 1,
    // Widget type
    // 'custom' for all non-standard widgets
    // 'chart' for highcharts widget
    type: 'custom'
  };
  isSpinner = false;
  markup?: SafeHtml;
  private san = inject(DomSanitizer);
  private subOnFilter?: Subscription;
  private subLinkedWidgetData?: Subscription;
  private currentData = '';
  private currentFilters = '';
  private currentWidgetData = '';


  ngOnInit(): void {
    if (this.widget?.dataLink) {
      this.subLinkedWidgetData = this.bs.subscribe('setLinkedWidgetData:' + this.widget.dataLink, (data: IMDXData) => {
        this._currentData = data;
        this.updateMarkup(this.currentFilters);
        this.cd.detectChanges();
        this.parent?.cd.detectChanges();
      });
    }

    super.ngOnInit();
    this.updateMarkup();

    this.subOnFilter = this.fs.onApplyFilter.subscribe(flt => {
      this.updateMarkup(flt.value);
    });
  }

  ngDoCheck() {
    const nextData = this.getData();
    const nextWidgetData = this.getWidgetDataSignature();
    if (nextData !== this.currentData || nextWidgetData !== this.currentWidgetData) {
      this.updateMarkup(this.currentFilters);
    }
  }

  getData(): string {
    return this.widget?.properties?.Data || '';
  }

  override requestData() {
    this.clearError();
    this.isSpinner = false;
    this.updateMarkup(this.currentFilters);
    this.cd.detectChanges();
    this.parent?.cd.detectChanges();
  }

  override retrieveData(data: IMDXData) {
    super.retrieveData(data);
    if (data?.Error) {
      return;
    }

    this.updateMarkup(this.currentFilters);
    this.cd.detectChanges();
    this.parent?.cd.detectChanges();
  }

  private updateMarkup(filters = '') {
    this.currentFilters = filters;
    this.currentData = this.getData();
    this.currentWidgetData = this.getWidgetDataSignature();
    this.markup = this.san.bypassSecurityTrustHtml(buildHtmlViewerMarkup(this.currentData, {
      filters,
      widgetData: this._currentData
    }));
  }

  private getWidgetDataSignature(): string {
    try {
      return JSON.stringify(this._currentData || null);
    } catch {
      return '';
    }
  }

  ngOnDestroy() {
    this.subOnFilter?.unsubscribe();
    this.subLinkedWidgetData?.unsubscribe();
    super.ngOnDestroy();
  }
}

function buildHtmlViewerMarkup(source: string, context?: { filters?: string; widgetData?: unknown }): string {
  const explicitSource = (source || '').trim();
  const linkedWidgetSource = extractLinkedWidgetSource(context?.widgetData);
  const raw = explicitSource || linkedWidgetSource;
  const content = substituteFilters(raw, context?.filters || '').trim();

  if (!content) {
    return '';
  }

  const renderable = parseRenderableSource(content);
  if (renderable?.type === 'html') {
    return renderable.value;
  }

  if (renderable?.type === 'url') {
    return wrapUrlAsIframe(renderable.value);
  }

  return content;
}

function substituteFilters(content: string, filterValue: string): string {
  if (!content) {
    return '';
  }

  if (!filterValue) {
    return content;
  }

  return content.replace(/\{\{\s*filter\s*\}\}/gi, filterValue);
}

function looksLikeHtml(content: string): boolean {
  return /<[^>]+>/.test(content);
}

function looksLikeUrl(content: string): boolean {
  return /^(https?:\/\/|data:|\/csp\/|csp\/)/i.test(content);
}

function parseRenderableSource(content: string): { type: 'html' | 'url'; value: string } | null {
  const urlMarkerMatch = content.match(/^\[url]\s*(.+)$/i);
  if (urlMarkerMatch?.[1]?.trim()) {
    return {
      type: 'url',
      value: urlMarkerMatch[1].trim()
    };
  }

  if (looksLikeHtml(content)) {
    return {
      type: 'html',
      value: content
    };
  }

  if (looksLikeUrl(content)) {
    return {
      type: 'url',
      value: content
    };
  }

  return null;
}

function wrapUrlAsIframe(url: string): string {
  return `<iframe src="${escapeAttribute(url)}" style="display:block;border:none;width:100%;height:100%;min-height:100%" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function extractLinkedWidgetSource(widgetData: unknown): string {
  if (!widgetData || typeof widgetData !== 'object') {
    return '';
  }

  const cols = (widgetData as { Cols?: Array<{ tuples?: Array<Record<string, unknown>> }> }).Cols;
  if (!Array.isArray(cols)) {
    return '';
  }

  const members = extractTupleMembers(cols);
  for (const member of members) {
    const renderable = parseRenderableSource(member);
    if (renderable) {
      return renderable.value;
    }
  }

  return '';
}

function extractTupleMembers(cols: Array<{ tuples?: Array<Record<string, unknown>> }>): string[] {
  const members: string[] = [];

  cols.forEach((col, axisIndex) => {
    col?.tuples?.forEach(tuple => {
      if (axisIndex > 0 && tuple?.type !== 'msr') {
        pushCandidate(members, tuple.caption);
        pushCandidate(members, tuple.dimension);
        pushCandidate(members, unwrapPathMember(tuple.path));
        pushCandidate(members, tuple.title);
      }

      pushCandidate(members, tuple.caption);
      pushCandidate(members, tuple.dimension);
      pushCandidate(members, unwrapPathMember(tuple.path));
      pushCandidate(members, tuple.title);
    });
  });

  return members;
}

function pushCandidate(target: string[], value: unknown): void {
  if (typeof value !== 'string') {
    return;
  }

  const normalized = value.trim();
  if (!normalized || target.includes(normalized)) {
    return;
  }

  target.push(normalized);
}

function unwrapPathMember(path: unknown): string {
  if (typeof path !== 'string') {
    return '';
  }

  const memberMatch = path.match(/&\[(.*)]$/);
  if (!memberMatch?.[1]) {
    return '';
  }

  return memberMatch[1]
    .replace(/\\]/g, ']')
    .replace(/\\\\/g, '\\')
    .trim();
}
