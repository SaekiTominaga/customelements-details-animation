var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _animation, _keyframeAnimationOptions, _supportCssTypedOM, _summaryElement, _summaryToggleHtml, _detailsContentElement, _summaryClickEventListener;
/**
 * Animate the opening or closing process of the <details> element by Custom Elements.
 */
export default class DetailsAnimation extends HTMLDetailsElement {
    constructor() {
        super();
        _animation.set(this, null);
        _keyframeAnimationOptions.set(this, {
            duration: 500,
            easing: 'ease',
        }); // https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#parameters
        _supportCssTypedOM.set(this, void 0); // CSS Typed Object Model に対応しているか https://caniuse.com/mdn-api_element_attributestylemap
        _summaryElement.set(this, null); // <summary> 要素
        _summaryToggleHtml.set(this, void 0); // <summary> 要素内のテキスト（HTML）
        _detailsContentElement.set(this, null); // <details> 要素内の <summary> 要素を除くコンテンツを囲う要素
        _summaryClickEventListener.set(this, void 0);
        __classPrivateFieldSet(this, _supportCssTypedOM, this.attributeStyleMap !== undefined);
        __classPrivateFieldSet(this, _summaryClickEventListener, this._summaryClickEvent.bind(this));
    }
    connectedCallback() {
        const summaryElement = this.querySelector('summary');
        if (summaryElement === null) {
            throw new Error('Element <details> is missing a required instance of child element <summary>.');
        }
        __classPrivateFieldSet(this, _summaryElement, summaryElement);
        if (window.HTMLDetailsElement === undefined) {
            /* <details> 未対応ブラウザ */
            summaryElement.tabIndex = 0;
            this.open = this.getAttribute('open') !== null;
        }
        this.dataset.preOpen = String(this.open);
        const duration = this.dataset.duration;
        if (duration !== undefined) {
            __classPrivateFieldGet(this, _keyframeAnimationOptions).duration = Number(duration);
        }
        const easing = this.dataset.easing;
        if (easing !== undefined) {
            __classPrivateFieldGet(this, _keyframeAnimationOptions).easing = easing;
        }
        __classPrivateFieldSet(this, _summaryToggleHtml, this.dataset.summaryToggle);
        if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
            this.attributeStyleMap.set('overflow', 'hidden');
        }
        else {
            this.style.overflow = 'hidden';
        }
        /* <summary> を除くノードをラップする */
        const fragment = document.createDocumentFragment();
        let nextNode = summaryElement.nextSibling;
        while (nextNode !== null) {
            fragment.appendChild(nextNode);
            nextNode = summaryElement.nextSibling;
        }
        const detailsContentElement = document.createElement('div');
        if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
            detailsContentElement.attributeStyleMap.set('display', 'flex'); // margin の相殺を避けるために Block formatting context を生成
        }
        else {
            detailsContentElement.style.display = 'flex';
        }
        detailsContentElement.appendChild(fragment);
        summaryElement.insertAdjacentElement('afterend', detailsContentElement);
        __classPrivateFieldSet(this, _detailsContentElement, detailsContentElement);
        summaryElement.addEventListener('click', __classPrivateFieldGet(this, _summaryClickEventListener));
    }
    disconnectedCallback() {
        const summaryElement = __classPrivateFieldGet(this, _summaryElement);
        summaryElement.removeEventListener('click', __classPrivateFieldGet(this, _summaryClickEventListener));
    }
    /**
     * <summary> 要素をクリックしたときの処理
     *
     * @param {Event} ev - Event
     */
    _summaryClickEvent(ev) {
        ev.preventDefault();
        const preOpen = this.dataset.preOpen !== 'true';
        this.dataset.preOpen = String(preOpen);
        this._toggleSummaryText();
        if (__classPrivateFieldGet(this, _animation)?.playState === 'running') {
            /* アニメーションが終わらないうちに連続して <summary> がクリックされた場合 */
            const height = this.offsetHeight;
            if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
                this.attributeStyleMap.set('height', CSS.px(height));
            }
            else {
                this.style.height = `${height}px`;
            }
            __classPrivateFieldGet(this, _animation).cancel();
        }
        if (preOpen) {
            this._open();
        }
        else {
            this._close();
        }
    }
    /**
     * <summary> 要素内のテキスト表示を切り替える
     */
    _toggleSummaryText() {
        const summaryToggleHtml = __classPrivateFieldGet(this, _summaryToggleHtml);
        if (summaryToggleHtml !== undefined) {
            const summaryElement = __classPrivateFieldGet(this, _summaryElement);
            __classPrivateFieldSet(this, _summaryToggleHtml, summaryElement.innerHTML);
            summaryElement.innerHTML = summaryToggleHtml;
        }
    }
    /**
     * コンテンツエリアを開く処理
     */
    _open() {
        const detailsHeight = this.offsetHeight;
        this.open = true;
        const summaryHeight = __classPrivateFieldGet(this, _summaryElement).offsetHeight;
        const detailsContentHeight = __classPrivateFieldGet(this, _detailsContentElement).offsetHeight;
        __classPrivateFieldSet(this, _animation, this.animate({
            height: [`${detailsHeight}px`, `${summaryHeight + detailsContentHeight}px`],
        }, __classPrivateFieldGet(this, _keyframeAnimationOptions)));
        __classPrivateFieldGet(this, _animation).onfinish = () => {
            if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
                this.attributeStyleMap.delete('height');
            }
            else {
                this.style.height = '';
            }
        };
    }
    /**
     * コンテンツエリアを閉じる処理
     */
    _close() {
        const detailsHeight = this.offsetHeight;
        const summaryHeight = __classPrivateFieldGet(this, _summaryElement).offsetHeight;
        __classPrivateFieldSet(this, _animation, this.animate({
            height: [`${detailsHeight}px`, `${summaryHeight}px`],
        }, __classPrivateFieldGet(this, _keyframeAnimationOptions)));
        __classPrivateFieldGet(this, _animation).onfinish = () => {
            this.open = false;
            if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
                this.attributeStyleMap.delete('height');
            }
            else {
                this.style.height = '';
            }
        };
    }
}
_animation = new WeakMap(), _keyframeAnimationOptions = new WeakMap(), _supportCssTypedOM = new WeakMap(), _summaryElement = new WeakMap(), _summaryToggleHtml = new WeakMap(), _detailsContentElement = new WeakMap(), _summaryClickEventListener = new WeakMap();
//# sourceMappingURL=DetailsAnimation.js.map