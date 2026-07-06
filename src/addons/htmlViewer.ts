import {Component, DoCheck, inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {BaseWidget} from "../app/components/widgets/base-widget.class";
import {IAddonInfo} from "../app/services/dsw.types";
import {buildHtmlViewerMarkup} from "../app/services/html-viewer.util";

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
  private currentData = '';
  private currentFilters = '';


  ngOnInit(): void {
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

  getData(): string {
    return this.widget?.properties?.Data || '';
  }

  private updateMarkup(filters = '') {
    this.currentFilters = filters;
    this.currentData = this.getData();
    this.markup = this.san.bypassSecurityTrustHtml(buildHtmlViewerMarkup(this.currentData, filters));
  }

  ngOnDestroy() {
    this.subOnFilter?.unsubscribe();
    super.ngOnDestroy();
  }
}
