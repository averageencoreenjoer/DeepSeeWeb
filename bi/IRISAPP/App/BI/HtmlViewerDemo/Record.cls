Class App.BI.HtmlViewerDemo.Record Extends %Persistent
{

Property Title As %String(MAXLEN = 200) [ Required ];

Property Category As %String(MAXLEN = 100) [ Required ];

Property Url As %String(MAXLEN = 4000) [ Required ];

Property HtmlSnippet As %String(MAXLEN = 4000);

Property SortOrder As %Integer [ InitialExpression = 0 ];

Index TitleIdx On Title [ Type = bitmap ];

Index CategoryIdx On Category [ Type = bitmap ];

}
