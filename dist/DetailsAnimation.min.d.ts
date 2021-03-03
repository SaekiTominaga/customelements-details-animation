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
     * <summary> 要素の表示を切り替える
     */
    private _toggleSummary;
    /**
     * コンテンツエリアを開く処理
     */
    private _open;
    /**
     * コンテンツエリアを閉じる処理
     */
    private _close;
    /**
     * <summary> 要素上にマウスカーソルが入ったときの処理
     */
    private _summaryMouseEnterEvent;
    /**
     * <summary> 要素上からマウスカーソルが外れたときの処理
     */
    private _summaryMouseLeaveEvent;
    /**
     * 開閉アニメーションが終了したときの処理
     */
    private _detailsContentTransitionEndEvent;
    /**
     * ウィンドウサイズを変更した時の処理（ResizeObserver API 未対応ブラウザ）
     */
    private _windowResizeEvent;
    /**
     * コンテンツエリアの矩形が変化した時の処理
     */
    private _detailContentResize;
}
//# sourceMappingURL=DetailsAnimation.d.ts.map