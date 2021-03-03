/**
 * Animate the opening or closing process of the <details> element by Custom Elements.
 */
export default class DetailsAnimation extends HTMLDetailsElement {
    #private;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * <summary> 要素をクリックしたときの処理
     *
     * @param {Event} ev - Event
     */
    private _summaryClickEvent;
    /**
     * <summary> 要素内のテキスト表示を切り替える
     */
    private _toggleSummaryText;
    /**
     * コンテンツエリアを開く処理
     */
    private _open;
    /**
     * コンテンツエリアを閉じる処理
     */
    private _close;
}
//# sourceMappingURL=DetailsAnimation.d.ts.map