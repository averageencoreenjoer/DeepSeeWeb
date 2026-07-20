#!/usr/bin/env bash

set -euo pipefail

docker compose exec -T iris iris session IRIS <<'EOF'
zn "IRISAPP"

set sc = $System.OBJ.Load("/home/irisowner/irisdev/bi/IRISAPP/App/BI/HtmlViewerDemo/Record.cls","ck")
do:$SYSTEM.Status.IsError(sc) $SYSTEM.Status.DisplayError(sc)
set sc = $System.OBJ.Load("/home/irisowner/irisdev/bi/IRISAPP/App/BI/HtmlViewerDemo/Cube.cls","ck")
do:$SYSTEM.Status.IsError(sc) $SYSTEM.Status.DisplayError(sc)
set sc = $System.OBJ.Load("/home/irisowner/irisdev/bi/IRISAPP/App/BI/HtmlViewerDemo/HelloPage.cls","ck")
do:$SYSTEM.Status.IsError(sc) $SYSTEM.Status.DisplayError(sc)
set sc = $System.OBJ.Load("/home/irisowner/irisdev/bi/IRISAPP/App/BI/HtmlViewerDemo/Setup.cls","ck")
do:$SYSTEM.Status.IsError(sc) $SYSTEM.Status.DisplayError(sc)
set sc = $System.OBJ.LoadDir("/home/irisowner/irisdev/.deps/iris-bi-utils/src/BIInstruments","ck",1)
do:$SYSTEM.Status.IsError(sc) $SYSTEM.Status.DisplayError(sc)

set sc = ##class(App.BI.HtmlViewerDemo.Setup).SeedData()
do:$SYSTEM.Status.IsError(sc) $SYSTEM.Status.DisplayError(sc)
set sc = ##class(App.BI.HtmlViewerDemo.Setup).BuildCube()
do:$SYSTEM.Status.IsError(sc) $SYSTEM.Status.DisplayError(sc)

do ##class(BIInstruments.utils).workdir("/home/irisowner/irisdev/bi/IRISAPP/")
do ##class(BIInstruments.import).import("*.*","cku-d",.err,1,.loaded,1)

set dashName="HTML Viewer Final Demo"
set fullName=dashName_".dashboard"
set exists=##class(%DeepSee.Dashboard.Utils).%DashboardExists(fullName)
if exists set dash=##class(%DeepSee.Dashboard.Utils).%OpenDashboard(fullName,.sc)
if exists for  quit:'dash.widgets.Count()  do dash.widgets.RemoveAt(1)
if 'exists set dash=##class(%DeepSee.Dashboard.Definition).%New()
if 'exists set dash.name=dashName
if 'exists set dash.public=1
if 'exists set dash.shared=1
set dash.gridCols=12
set dash.gridRows=8
set dash.snapGrid=1
set dash.snapTo=1
set dash.backgroundColor="white"
set dash.widgetBorders="1px solid #F0F0F0"

set urlPivot=##class(%DeepSee.Dashboard.Widget).%New()
set urlPivot.name="Hello Links Pivot"
set urlPivot.title="Hello Links Pivot"
set urlPivot.type="pivot"
set urlPivot.subtype="pivot"
set urlPivot.dataSource="HTML Viewer Demo/Hello Links.pivot"
set urlPivot.top=0
set urlPivot.left=0
set urlPivot.width=6
set urlPivot.height=4
set urlPivot.homeColL=0
set urlPivot.homeRowL=0
set urlPivot.colSpanL=6
set urlPivot.rowSpanL=4
set urlPivot.sidebarContent="This pivot exposes [url]... members from App.BI.HtmlViewerDemo.Record.Url. The linked htmlViewer reads that payload and renders it as an iframe source."
set urlPivot.showSidebar=1
do urlPivot.properties.SetAt(1,"analyzer")
do urlPivot.properties.SetAt(1,"excel")
do urlPivot.properties.SetAt(1,"print")
do urlPivot.properties.SetAt(1,"showDimensions")
do dash.widgets.Insert(urlPivot)

set urlViewer=##class(%DeepSee.Dashboard.Widget).%New()
set urlViewer.name="Linked URL HTML Viewer Widget"
set urlViewer.title="Linked URL HTML Viewer Widget"
set urlViewer.type="pivot"
set urlViewer.subtype="DSW.Addons.htmlViewer"
set urlViewer.dataLink="Hello Links Pivot"
set urlViewer.top=0
set urlViewer.left=6
set urlViewer.width=6
set urlViewer.height=4
set urlViewer.homeColL=6
set urlViewer.homeRowL=0
set urlViewer.colSpanL=6
set urlViewer.rowSpanL=4
set urlViewer.sidebarContent="This htmlViewer is linked to Hello Links Pivot and renders the first [url]... payload it receives from the pivot."
set urlViewer.showSidebar=1
do urlViewer.properties.SetAt("","Data")
do dash.widgets.Insert(urlViewer)

set htmlPivot=##class(%DeepSee.Dashboard.Widget).%New()
set htmlPivot.name="Hello HTML Pivot"
set htmlPivot.title="Hello HTML Pivot"
set htmlPivot.type="pivot"
set htmlPivot.subtype="pivot"
set htmlPivot.dataSource="HTML Viewer Demo/Hello HTML.pivot"
set htmlPivot.top=4
set htmlPivot.left=0
set htmlPivot.width=6
set htmlPivot.height=4
set htmlPivot.homeColL=0
set htmlPivot.homeRowL=4
set htmlPivot.colSpanL=6
set htmlPivot.rowSpanL=4
set htmlPivot.sidebarContent="This pivot exposes raw HTML members from App.BI.HtmlViewerDemo.Record.HtmlSnippet. The linked htmlViewer renders them as markup because they do not start with [url]."
set htmlPivot.showSidebar=1
do htmlPivot.properties.SetAt(1,"analyzer")
do htmlPivot.properties.SetAt(1,"excel")
do htmlPivot.properties.SetAt(1,"print")
do htmlPivot.properties.SetAt(1,"showDimensions")
do dash.widgets.Insert(htmlPivot)

set htmlViewer=##class(%DeepSee.Dashboard.Widget).%New()
set htmlViewer.name="Linked HTML Snippet Viewer Widget"
set htmlViewer.title="Linked HTML Snippet Viewer Widget"
set htmlViewer.type="pivot"
set htmlViewer.subtype="DSW.Addons.htmlViewer"
set htmlViewer.dataLink="Hello HTML Pivot"
set htmlViewer.top=4
set htmlViewer.left=6
set htmlViewer.width=6
set htmlViewer.height=4
set htmlViewer.homeColL=6
set htmlViewer.homeRowL=4
set htmlViewer.colSpanL=6
set htmlViewer.rowSpanL=4
set htmlViewer.sidebarContent="This htmlViewer is linked to Hello HTML Pivot and renders the first raw HTML payload it receives from the pivot."
set htmlViewer.showSidebar=1
do htmlViewer.properties.SetAt("","Data")
do dash.widgets.Insert(htmlViewer)

set sc=dash.%Save()
set saved=##class(%DeepSee.Dashboard.Utils).%OpenDashboard(fullName,.openSc)
set widgetCount=$select($isobject(saved):saved.widgets.Count(),1:0)
set htmlSubtype=""
set htmlDataLen=0
set widgetNames=""
if $isobject(saved) set key=0
if $isobject(saved) for  set key=saved.widgets.Next(key) quit:'key  set widget=saved.widgets.GetAt(key) set:widgetNames'="" widgetNames=widgetNames_"," set widgetNames=widgetNames_widget.name if widget.subtype="DSW.Addons.htmlViewer" set htmlSubtype=widget.subtype,htmlDataLen=htmlDataLen+$length(widget.properties.GetAt("Data"))

write "SAVE_SC=",sc,!
write "OPEN_SC=",openSc,!
write "DASHBOARD=",fullName,!
write "WIDGETS=",widgetCount,!
write "WIDGET_NAMES=",widgetNames,!
write "HTML_SUBTYPE=",htmlSubtype,!
write "HTML_DATA_LEN=",htmlDataLen,!
halt
EOF
