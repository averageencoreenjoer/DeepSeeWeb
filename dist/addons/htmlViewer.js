"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlViewer = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@angular/core");
const platform_browser_1 = require("@angular/platform-browser");
const base_widget_class_1 = require("../app/components/widgets/base-widget.class");
let HtmlViewer = class HtmlViewer extends base_widget_class_1.BaseWidget {
    constructor() {
        super(...arguments);
        this.isSpinner = false;
        this.san = (0, core_1.inject)(platform_browser_1.DomSanitizer);
        this.currentData = '';
        this.currentFilters = '';
        this.currentWidgetData = '';
    }
    static { this.AddonInfo = {
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
    }; }
    ngOnInit() {
        if (this.widget?.dataLink) {
            this.subLinkedWidgetData = this.bs.subscribe('setLinkedWidgetData:' + this.widget.dataLink, (data) => {
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
    getData() {
        return this.widget?.properties?.Data || '';
    }
    requestData() {
        this.clearError();
        this.isSpinner = false;
        this.updateMarkup(this.currentFilters);
        this.cd.detectChanges();
        this.parent?.cd.detectChanges();
    }
    retrieveData(data) {
        super.retrieveData(data);
        if (data?.Error) {
            return;
        }
        this.updateMarkup(this.currentFilters);
        this.cd.detectChanges();
        this.parent?.cd.detectChanges();
    }
    updateMarkup(filters = '') {
        this.currentFilters = filters;
        this.currentData = this.getData();
        this.currentWidgetData = this.getWidgetDataSignature();
        this.markup = this.san.bypassSecurityTrustHtml(buildHtmlViewerMarkup(this.currentData, {
            filters,
            widgetData: this._currentData
        }));
    }
    getWidgetDataSignature() {
        try {
            return JSON.stringify(this._currentData || null);
        }
        catch {
            return '';
        }
    }
    ngOnDestroy() {
        this.subOnFilter?.unsubscribe();
        this.subLinkedWidgetData?.unsubscribe();
        super.ngOnDestroy();
    }
};
exports.HtmlViewer = HtmlViewer;
exports.HtmlViewer = HtmlViewer = tslib_1.__decorate([
    (0, core_1.Component)({
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
], HtmlViewer);
function buildHtmlViewerMarkup(source, context) {
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
function substituteFilters(content, filterValue) {
    if (!content) {
        return '';
    }
    if (!filterValue) {
        return content;
    }
    return content.replace(/\{\{\s*filter\s*\}\}/gi, filterValue);
}
function looksLikeHtml(content) {
    return /<[^>]+>/.test(content);
}
function looksLikeUrl(content) {
    return /^(https?:\/\/|data:|\/csp\/|csp\/)/i.test(content);
}
function parseRenderableSource(content) {
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
function wrapUrlAsIframe(url) {
    return `<iframe src="${escapeAttribute(url)}" style="display:block;border:none;width:100%;height:100%;min-height:100%" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}
function escapeAttribute(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function extractLinkedWidgetSource(widgetData) {
    if (!widgetData || typeof widgetData !== 'object') {
        return '';
    }
    const cols = widgetData.Cols;
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
function extractTupleMembers(cols) {
    const members = [];
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
function pushCandidate(target, value) {
    if (typeof value !== 'string') {
        return;
    }
    const normalized = value.trim();
    if (!normalized || target.includes(normalized)) {
        return;
    }
    target.push(normalized);
}
function unwrapPathMember(path) {
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
