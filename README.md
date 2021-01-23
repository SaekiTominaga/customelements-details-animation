# Animated motion `<details>` by Custom Elements

[![npm version](https://badge.fury.io/js/%40saekitominaga%2Fcustomelements-details-animation.svg)](https://badge.fury.io/js/%40saekitominaga%2Fcustomelements-details-animation)

Animate the opening or closing process of the [`<details>` element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element) by Custom Elements.

## Demo

- [Demo page](https://saekitominaga.github.io/customelements-details-animation/demo.html)

## Examples

```HTML
<details is="x-details-animation"
  open=""
  data-content-element="x-details-animation-content"
  data-summary-toggle="Caption Text (&lt;b&gt;close&lt;/b&gt;)"
>
  <summary>Caption Text (<b>open</b>)</summary>
  <p>Contents text</p>
</details>
```

## Attributes

<dl>
<dt>open [optional]</dt>
<dd>Whether the details are visible. (<a href="https://html.spec.whatwg.org/multipage/interactive-elements.html#attr-details-open">open attribute of &lt;details&gt; Element</a>)</dd>
<dt>data-content-element [optional]</dt>
<dd>Custom element name for the &lt;details&gt; content (Content excluding &lt;summary&gt; in the &lt;details&gt; element). Note that custom element names must contain a hyphen. The default value is `x-animation-details-content`.</dd>
<dt>data-summary-toggle [optional]</dt>
<dd>Switch the contents of the &lt;summary&gt; element when opening or closing. You can write HTML markup directly.</dd>
</dl>
