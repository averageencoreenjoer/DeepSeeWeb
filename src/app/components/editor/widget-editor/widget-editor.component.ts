import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {SidebarService} from "../../../services/sidebar.service";
import {DashboardService} from "../../../services/dashboard.service";
import {dsw} from "../../../../environments/dsw";
import {EditorService} from "../../../services/editor.service";

import {FormsModule} from "@angular/forms";
import {InputComponent} from "../../ui/input/input/input.component";
import {SidebarActionsComponent} from "../../ui/sidebar-actions/sidebar-actions.component";
import {IWidgetDesc} from "../../../services/dsw.types";

@Component({
  selector: 'dsw-widget-editor',
  templateUrl: './widget-editor.component.html',
  styleUrls: ['./../editor-styles.scss', './widget-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SidebarActionsComponent, InputComponent, FormsModule]
})
export class WidgetEditorComponent implements OnInit {
  @Input() widget?: IWidgetDesc;
  @Input() invalid: string[] = [];
  model: Partial<IWidgetDesc> = {
    edKey: 'ed' + new Date().getTime(),

    dashboard: this.dbs.current.value,
    name: '',
    title: '',
    dataSource: '',
    type: 'pivot',
    dataLink: '',

    // Needed to display widget correctly
    dataProperties: [],
    dependents: [],
    controls: [],
    mdx: '',
    properties: {} as any,

    // Gridster
    x: 0,
    y: 0,
    rows: 4,
    cols: 4
  };

  constructor(private dbs: DashboardService,
              private eds: EditorService,
              private sbs: SidebarService) {
  }

  ngOnInit() {
    this.eds.resetSavedState();

    if (!this.widget) {
      this.initializeNewWidget();
    } else {
      this.model = this.widget;
      this.widget.oldWidget = JSON.parse(JSON.stringify(this.widget));
      this.eds.updateEditedWidget({widget: this.model});
      this.eds.resetSavedState();
    }
  }

  onCancelEditing() {
    this.eds.cancelEditing();
    this.close();
  }

  onSave() {
    this.eds.save(this.model);
  }

  onTypeAndDataSourceClick() {
    this.eds.navigateDataSourceAndType(this.model);
  }

  onWidgetSettingsClick() {
    this.sbs.showComponent({
      component: import('./../widget-settings/widget-settings.component'),
      single: true,
      inputs: {
        model: this.model
      }
    });
  }

  updateWidget() {
    this.eds.updateEditedWidget({widget: this.model});
  }

  deleteWidgetClick() {
    this.eds.deleteWidget(this.model as IWidgetDesc);
  }

  /**
   * Close sidebar and stop editing
   */
  private close() {
    this.sbs.hide();
  }

  private initializeNewWidget() {
    const count = this.dbs.getWidgets().filter(w => w.type !== dsw.const.emptyWidgetClass).length + 1;
    this.model.name = `Widget${count}`;
    this.eds.onNewWidget.emit(this.model);
  }
}
