# HTML Web View

`HTML web view` is the editor-facing name of the built-in addon `DSW.Addons.htmlViewer`.

It renders one string payload in one of two ways:
* URL mode: the payload is used as an iframe source
* HTML mode: the payload is rendered as raw HTML inside the widget

## When to use it

Use `HTML web view` when a dashboard needs to display:
* an IRIS CSP page
* an external or internal web page in an iframe
* a small HTML snippet generated from BI data

## Data sources

The widget can read payloads from two places.

### Direct mode

Set the payload in `Widget settings -> Data`.

Use this when the widget is fully static or when the payload is built with runtime placeholders such as `$$$FILTERS`.

Example URL payload:

```text
[url]/csp/app/MyEmbeddedPage.cls?title=Hello%20from%20dashboard
```

Example HTML payload:

```html
<div style="padding:16px">
  <h2>Hello</h2>
  <p>Rendered as raw HTML.</p>
</div>
```

### Linked mode

Set `Reference to` to another widget, usually a pivot. The linked widget must return the payload value in its data.

This is the preferred production pattern because the render payload stays in BI data and can be controlled by cube logic.

Recommended chain:

1. Add a source field that contains either raw HTML or a `[url]...` value.
2. Expose that field in the cube.
3. Create a pivot that returns that field.
4. Create an `HTML web view` widget.
5. Set `Reference to` to the pivot widget.
6. When the pivot data changes or the user selects a row, the viewer re-renders from the linked payload.

## Rendering rules

Payload resolution order:

1. `Widget settings -> Data`
2. Linked payload from `Reference to`

Mode detection:

1. If the payload starts with `[url]`, `HTML web view` always uses URL mode.
2. Otherwise, if the payload looks like HTML markup, it uses HTML mode.
3. Otherwise, if the payload starts with one of the supported URL prefixes, it uses URL mode.
4. Otherwise, the value is rendered as plain content.

Auto-detected URL prefixes:
* `http://`
* `https://`
* `data:`
* `/csp/`
* `csp/`

Use `[url]...` when you want explicit behavior and do not want the widget to guess.

## URL mode

In URL mode the widget creates an iframe and assigns the payload as `src`.

Use URL mode for:
* CSP pages
* embedded applications
* reports or helper pages that should stay isolated from the dashboard DOM

Example:

```text
[url]/csp/app/MyEmbeddedPage.cls?title=Hello%20from%20iframe
```

## HTML mode

In HTML mode the widget injects the payload as markup.

Use HTML mode for:
* badges
* formatted notices
* compact BI-driven layouts
* generated markup fragments stored in cube source data

Example:

```html
<section style="padding:18px;font-family:Arial,sans-serif">
  <h3 style="margin:0 0 8px">Hello from HTML</h3>
  <p style="margin:0">This content is rendered directly inside the widget.</p>
</section>
```

Only use trusted HTML in this mode.

## Editor behavior

In the DSW editor:
* select the widget type as `HTML web view`
* use `Widget settings -> Data` for direct payloads
* use `Reference to` for linked pivot payloads
* `Data source` stays empty because the viewer itself does not execute MDX

In the legacy IRIS dashboard editor, custom addon properties such as `Data` are not exposed well. For direct mode, prefer the DSW editor or edit dashboard XML directly.

## Minimal BI recipe

1. Add two source fields in your BI record class:
   * `Url` with values like `[url]/csp/...`
   * `HtmlSnippet` with raw HTML
2. Expose them in the cube as dimensions or fields used by a pivot.
3. Build a pivot that returns `Url`.
4. Build a second pivot that returns `HtmlSnippet`.
5. Create two `HTML web view` widgets.
6. Point each widget `Reference to` the matching pivot.

This gives one iframe-driven widget and one inline-HTML widget, both fully controlled by cube data.
