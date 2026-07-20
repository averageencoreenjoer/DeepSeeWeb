Class App.BI.HtmlViewerDemo.Cube Extends %DeepSee.CubeDefinition [ DependsOn = App.BI.HtmlViewerDemo.Record ]
{

Parameter DOMAIN = "IRISAPP";

XData Cube [ XMLNamespace = "http://www.intersystems.com/deepsee" ]
{
<cube
name="HtmlViewerDemo"
displayName="HtmlViewerDemo"
owner="_SYSTEM"
sourceClass="App.BI.HtmlViewerDemo.Record"
nullReplacement="(none)">

<dimension name="CategoryD" displayName="Category">
<hierarchy name="H1" displayName="H1">
<level name="Category" displayName="Category"
sourceProperty="Category"
factName="DxCategory"/>
</hierarchy>
</dimension>

<dimension name="PageD" displayName="Page">
<hierarchy name="H1" displayName="H1">
<level name="Page" displayName="Page"
sourceProperty="Title"
factName="DxPage"/>
</hierarchy>
</dimension>

<dimension name="UrlD" displayName="URL" hasAll="false">
<hierarchy name="H1" displayName="H1">
<level name="URL" displayName="URL"
sourceProperty="Url"
factName="DxUrl"/>
</hierarchy>
</dimension>

<dimension name="HtmlD" displayName="HTML" hasAll="false">
<hierarchy name="H1" displayName="H1">
<level name="HTML" displayName="HTML"
sourceProperty="HtmlSnippet"
factName="DxHtml"/>
</hierarchy>
</dimension>

<measure name="Link Count" displayName="Link Count"
sourceExpression="1"
aggregate="SUM"/>

<listing name="Demo links" disabled="false" listingType="table"
fieldList="ID,SortOrder,Category,Title,Url,HtmlSnippet"
sourceClass="App.BI.HtmlViewerDemo.Record">
</listing>

</cube>
}

}
