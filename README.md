# Animated motion `<details>` by Custom Elements

[![npm version](https://badge.fury.io/js/%40saekitominaga%2Fcustomelements-details-animation.svg)](https://badge.fury.io/js/%40saekitominaga%2Fcustomelements-details-animation)

Animate the opening or closing process of the [`<details>` element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element) by Custom Elements.

## Demo

- [Demo page](https://saekitominaga.github.io/customelements-details-animation/demo.html)

## Examples

```HTML
<details is="x-details-animation"
  open=""
  data-duration="1000"
  data-easing="linear"
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
<dt>data-duration [optional]</dt>
<dd>The iteration duration which is a real number greater than or equal to zero (including positive infinity) representing the time taken to complete a single iteration of the animation effect (See <a href="https://www.w3.org/TR/web-animations-1/#dictdef-optionaleffecttiming">OptionalEffectTiming</a> for details). If omitted, the default value is <code>500</code>(ms).</dd>
<dt>data-easing [optional]</dt>
<dd>The timing function used to scale the time to produce easing effects (See <a href="https://www.w3.org/TR/web-animations-1/#dictdef-optionaleffecttiming">OptionalEffectTiming</a> for details). If omitted, the default value is <code>ease</code>.</dd>
<dt>data-summary-toggle [optional]</dt>
<dd>Switch the contents of the &lt;summary&gt; element when opening or closing. You can write HTML markup directly.</dd>
</dl>

\* The `data-content-element` attribute that existed in version 1 series is obsolete in version 2.0.0 .

## CSS

In order to achieve animation, the timing of setting the `open` attribute of the `<details>` element is delayed. Therefore, the viewlet icon of the `<summary>` element should be determined by the `data-pre-open` attribute.

```CSS
details[data-pre-open] > summary {
  list-style: none;
}
details[data-pre-open] > summary::-webkit-details-marker {
  display: none;
} /* Chrome<=88 doesn't support `list-style`, so you need to use the `::-webkit-details-marker` pseudo-element <https://caniuse.com/mdn-html_elements_summary_display_list_item> */

details[data-pre-open] > summary::before {
  margin-right: 0.5em;
  display: inline-block;
  content: '▼';
}
details[data-pre-open='false'] > summary::before {
  transform: rotate(-90deg);
}
```

\* Don't forget to add `details[data-pre-open]` to all selectors. This will avoid styling in environments where JavaScript is disabled or where Customized built-in elements are not supported (e.g. Safari 14).
