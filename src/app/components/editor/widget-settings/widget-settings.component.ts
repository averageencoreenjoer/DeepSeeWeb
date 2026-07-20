import {Component, Input, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SidebarActionsComponent} from '../../ui/sidebar-actions/sidebar-actions.component';
import {IWidgetDesc} from '../../../services/dsw.types';
import {EditorService} from '../../../services/editor.service';
import {isHtmlViewerType} from '../../../services/html-viewer.util';
import {WidgetTypeService} from '../../../services/widget-type.service';

@Component({
  selector: 'dsw-widget-settings',
  templateUrl: './widget-settings.component.html',
  styleUrls: ['./../editor-styles.scss', './widget-settings.component.scss'],
  standalone: true,
  imports: [SidebarActionsComponent, FormsModule]
})
export class WidgetSettingsComponent implements OnInit {
  @Input() model?: Partial<IWidgetDesc>;
  dataValue = '';

  constructor(private eds: EditorService,
              private wts: WidgetTypeService) {
  }

  ngOnInit() {
    this.ensureProperties();
    this.dataValue = this.model?.properties?.Data || '';
  }

  isHtmlViewer(): boolean {
    return isHtmlViewerType(this.wts.getWidgetTypeName(this.model));
  }

  onDataChange(value: string) {
    this.dataValue = value;
    this.ensureProperties();
    if (!this.model?.properties) {
      return;
    }
    this.model.properties.Data = value;
    this.eds.updateEditedWidget({widget: this.model});
  }

  onSave() {
    if (!this.model) {
      return;
    }
    this.eds.save(this.model);
  }

  private ensureProperties() {
    if (!this.model) {
      return;
    }
    this.model.properties = this.model.properties || ({} as any);
  }
}
