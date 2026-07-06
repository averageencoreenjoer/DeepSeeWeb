"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlViewer = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@angular/core");
const platform_browser_1 = require("@angular/platform-browser");
const base_widget_class_1 = require("../app/components/widgets/base-widget.class");
const html_viewer_util_1 = require("../app/services/html-viewer.util");
let HtmlViewer = class HtmlViewer extends base_widget_class_1.BaseWidget {
    constructor() {
        super(...arguments);
        this.isSpinner = false;
        this.san = (0, core_1.inject)(platform_browser_1.DomSanitizer);
        this.currentData = '';
        this.currentFilters = '';
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
        this.updateMarkup();
        this.subOnFilter = this.fs.onApplyFilter.subscribe(flt => {
            this.updateMarkup(flt.value);
        });
    }
    ngDoCheck() {
        const nextData = this.getData();
        if (nextData !== this.currentData) {
            this.updateMarkup(this.currentFilters);
        }
    }
    getData() {
        return this.widget?.properties?.Data || '';
    }
    updateMarkup(filters = '') {
        this.currentFilters = filters;
        this.currentData = this.getData();
        this.markup = this.san.bypassSecurityTrustHtml((0, html_viewer_util_1.buildHtmlViewerMarkup)(this.currentData, filters));
    }
    ngOnDestroy() {
        this.subOnFilter?.unsubscribe();
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
