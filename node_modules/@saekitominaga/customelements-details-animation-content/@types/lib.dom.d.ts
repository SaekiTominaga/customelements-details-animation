interface ShadowRoot extends DocumentFragment, DocumentOrShadowRoot, InnerHTML {
	adoptedStyleSheets: CSSStyleSheet[];
}

interface CSSStyleSheet extends StyleSheet {
	replaceSync(style: string): void;
}
