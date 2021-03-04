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
var _supportCssTypedOM, _animation, _keyframeAnimationOptions, _summaryElement, _summaryToggleHtml, _detailsContentElement, _detailsContentHeight, _summaryClickEventListener;
/**
 * Animate the opening or closing process of the <details> element by Custom Elements.
 */
export default class DetailsAnimation extends HTMLDetailsElement {
    constructor() {
        super();
        _supportCssTypedOM.set(this, void 0); // CSS Typed Object Model に対応しているか https://caniuse.com/mdn-api_element_attributestylemap
        _animation.set(this, null);
        _keyframeAnimationOptions.set(this, {
            duration: 500,
            easing: 'ease',
        }); // https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#parameters
        _summaryElement.set(this, null); // <summary> 要素
        _summaryToggleHtml.set(this, null); // <summary> 要素内のテキスト（HTML）
        _detailsContentElement.set(this, null); // <details> 要素内の <summary> 要素を除くコンテンツを囲う要素
        _detailsContentHeight.set(this, null); // コンテンツを囲う要素の高さ
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
        __classPrivateFieldSet(this, _summaryToggleHtml, this.dataset.summaryToggle ?? null);
        /* <summary> を除くノードをラップする */
        const fragment = document.createDocumentFragment();
        let nextNode = summaryElement.nextSibling;
        while (nextNode !== null) {
            fragment.appendChild(nextNode);
            nextNode = summaryElement.nextSibling;
        }
        const detailsContentElement = document.createElement('div');
        if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
            detailsContentElement.attributeStyleMap.set('overflow', 'hidden');
        }
        else {
            detailsContentElement.style.overflow = 'hidden';
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
            const detailsContentElement = __classPrivateFieldGet(this, _detailsContentElement);
            const height = detailsContentElement.offsetHeight;
            if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
                detailsContentElement.attributeStyleMap.set('height', CSS.px(height));
            }
            else {
                detailsContentElement.style.height = `${height}px`;
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
        if (summaryToggleHtml !== null) {
            const summaryElement = __classPrivateFieldGet(this, _summaryElement);
            __classPrivateFieldSet(this, _summaryToggleHtml, summaryElement.innerHTML);
            summaryElement.innerHTML = summaryToggleHtml;
        }
    }
    /**
     * コンテンツエリアを開く処理
     */
    _open() {
        const detailsContentElement = __classPrivateFieldGet(this, _detailsContentElement);
        const startHeight = detailsContentElement.offsetHeight;
        this.open = true;
        const endHeight = __classPrivateFieldGet(this, _detailsContentHeight) ?? detailsContentElement.offsetHeight;
        __classPrivateFieldSet(this, _animation, detailsContentElement.animate({
            height: [`${startHeight}px`, `${endHeight}px`],
        }, __classPrivateFieldGet(this, _keyframeAnimationOptions)));
        __classPrivateFieldGet(this, _animation).onfinish = () => {
            __classPrivateFieldSet(this, _detailsContentHeight, detailsContentElement.offsetHeight);
            if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
                detailsContentElement.attributeStyleMap.delete('height');
            }
            else {
                detailsContentElement.style.height = '';
            }
        };
    }
    /**
     * コンテンツエリアを閉じる処理
     */
    _close() {
        const detailsContentElement = __classPrivateFieldGet(this, _detailsContentElement);
        const startHeight = detailsContentElement.offsetHeight;
        __classPrivateFieldSet(this, _detailsContentHeight, startHeight);
        __classPrivateFieldSet(this, _animation, detailsContentElement.animate({
            height: [`${startHeight}px`, '0px'],
        }, __classPrivateFieldGet(this, _keyframeAnimationOptions)));
        __classPrivateFieldGet(this, _animation).onfinish = () => {
            this.open = false;
            __classPrivateFieldSet(this, _detailsContentHeight, null);
            if (__classPrivateFieldGet(this, _supportCssTypedOM)) {
                detailsContentElement.attributeStyleMap.delete('height');
            }
            else {
                detailsContentElement.style.height = '';
            }
        };
    }
}
_supportCssTypedOM = new WeakMap(), _animation = new WeakMap(), _keyframeAnimationOptions = new WeakMap(), _summaryElement = new WeakMap(), _summaryToggleHtml = new WeakMap(), _detailsContentElement = new WeakMap(), _detailsContentHeight = new WeakMap(), _summaryClickEventListener = new WeakMap();
//# sourceMappingURL=DetailsAnimation.js.map