Class App.BI.HtmlViewerDemo.HelloPage Extends %CSP.Page
{

ClassMethod OnPage() As %Status
{
    set title = $get(%request.Data("title",1))
    if title="" {
        set title = "Hello from DeepSeeWeb demo"
    }

    write "<!doctype html>"
    write "<html><head><meta charset=""utf-8""><title>",..Escape(title),"</title>"
    write "<style>body{margin:0;padding:32px;font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a}"
    write "h1{margin:0 0 12px;font-size:28px}p{margin:0 0 10px;line-height:1.5}"
    write ".note{margin-top:18px;padding:14px 16px;border:1px solid #cbd5e1;border-radius:10px;background:#ffffff}</style>"
    write "</head><body>"
    write "<h1>",..Escape(title),"</h1>"
    write "<p>This page is served by IRIS CSP and is intended for the htmlViewer demo.</p>"
    write "<p>If you can read this inside the dashboard, the linked htmlViewer flow works.</p>"
    write "<div class=""note"">Source: <code>App.BI.HtmlViewerDemo.HelloPage</code></div>"
    write "</body></html>"
    quit $$$OK
}

ClassMethod Escape(value As %String = "") As %String [ CodeMode = expression ]
{
    $zconvert(value,"O","HTML")
}

}
