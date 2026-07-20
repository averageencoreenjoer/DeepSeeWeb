Class App.BI.HtmlViewerDemo.Setup
{

ClassMethod SeedData() As %Status
{
    set sc = 1
    set sc = ..ClearData()
    quit:$SYSTEM.Status.IsError(sc) sc

    set base = "/csp/irisapp/App.BI.HtmlViewerDemo.HelloPage.cls"
    set page1 = base_"?title=Hello%20from%20pivot"
    set url1 = "[url]"_page1
    set html1 = "<div style='font-family:sans-serif;padding:16px'><h2>Hello from stored HTML</h2><p>This HTML came from App.BI.HtmlViewerDemo.Record.HtmlSnippet.</p></div>"
    set sc = ..CreateRecord("Demo Links","Hello Page",url1,html1,10)
    quit:$SYSTEM.Status.IsError(sc) sc

    set page2 = base_"?title=Hello%20from%20iframe"
    set url2 = "[url]"_page2
    set html2 = "<iframe src='"_page2_"' style='width:100%;height:420px;border:0' loading='lazy'></iframe>"
    set sc = ..CreateRecord("Demo Links","InterSystems",url2,html2,20)
    quit:$SYSTEM.Status.IsError(sc) sc

    set page3 = base_"?title=Hello%20from%20dashboard"
    set url3 = "[url]"_page3
    set html3 = "<div style='font-family:sans-serif;padding:16px'><strong>Tip:</strong> this row is here to prove the cube contains both URL and HTML payload fields.</div>"
    set sc = ..CreateRecord("Analyzer Payloads","Iframe Source",url3,html3,30)
    quit:$SYSTEM.Status.IsError(sc) sc

    quit sc
}

ClassMethod ClearData() As %Status
{
    quit ##class(App.BI.HtmlViewerDemo.Record).%DeleteExtent()
}

ClassMethod CreateRecord(category As %String, title As %String, url As %String, html As %String, sortOrder As %Integer = 0) As %Status
{
    set record = ##class(App.BI.HtmlViewerDemo.Record).%New()
    set record.Category = category
    set record.Title = title
    set record.Url = url
    set record.HtmlSnippet = html
    set record.SortOrder = sortOrder
    quit record.%Save()
}

ClassMethod BuildCube() As %Status
{
    set buildStats = ""
    quit ##class(%DeepSee.Utils).%BuildCube("HtmlViewerDemo",0,1,0,0,1,.buildStats)
}

}
