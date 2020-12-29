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
var _preOpen, _animation, _supportCSSTypedOM, _summaryElement, _summaryToggleHTML, _detailsContentElement, _detailsContentCustomElementName, _windowResizeTimeoutId, _summaryClickEventListener, _summaryMouseEnterEventListener, _summaryMouseLeaveEventListener, _detailsContentTransitionEndEventListener, _windowResizeEventListener;
/**
 * Animate the opening or closing process of the <details> element by Custom Elements.
 *
 * @version 1.1.0
 */
export default class DetailsAnimation extends HTMLDetailsElement {
    constructor() {
        super();
        _preOpen.set(this, false); // アニメーションの実現のため本来の open 属性の反映タイミングは実際とは変えており、開閉処理が始まった瞬間の状態をこの変数に記録する
        _animation.set(this, false); // アニメーション中かどうか
        _supportCSSTypedOM.set(this, void 0); // CSS Typed Object Model に対応しているか（Chrome 66+, Chromium Edge） https://caniuse.com/mdn-api_element_attributestylemap
        _summaryElement.set(this, null);
        _summaryToggleHTML.set(this, void 0);
        _detailsContentElement.set(this, null); // <details> 要素内の <summary> 要素を除くコンテンツを囲う要素
        _detailsContentCustomElementName.set(this, 'x-details-animation-content'); // <details> 要素内の <summary> 要素を除くコンテンツを囲う要素の名前
        _windowResizeTimeoutId.set(this, null); // window.onresize のタイマーの識別 ID（clearTimeout() で使用）
        _summaryClickEventListener.set(this, void 0);
        _summaryMouseEnterEventListener.set(this, void 0);
        _summaryMouseLeaveEventListener.set(this, void 0);
        _detailsContentTransitionEndEventListener.set(this, void 0);
        _windowResizeEventListener.set(this, void 0);
        __classPrivateFieldSet(this, _supportCSSTypedOM, this.attributeStyleMap !== undefined);
        __classPrivateFieldSet(this, _summaryClickEventListener, this._summaryClickEvent.bind(this));
        __classPrivateFieldSet(this, _summaryMouseEnterEventListener, this._summaryMouseEnterEvent.bind(this));
        __classPrivateFieldSet(this, _summaryMouseLeaveEventListener, this._summaryMouseLeaveEvent.bind(this));
        __classPrivateFieldSet(this, _detailsContentTransitionEndEventListener, this._detailsContentTransitionEndEvent.bind(this));
        __classPrivateFieldSet(this, _windowResizeEventListener, this._windowResizeEvent.bind(this));
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
        const detailsContentCustomElementName = this.dataset.contentElement;
        if (detailsContentCustomElementName !== undefined) {
            if (!detailsContentCustomElementName.includes('-')) {
                throw new Error('Attribute: `data-content-element` value must contain a hyphen.');
            }
            __classPrivateFieldSet(this, _detailsContentCustomElementName, detailsContentCustomElementName);
        }
        __classPrivateFieldSet(this, _summaryToggleHTML, this.dataset.summaryToggle);
        /* <summary> を除くノードを <div> でラップする */
        const fragment = document.createDocumentFragment();
        let nextNode = summaryElement.nextSibling;
        while (nextNode !== null) {
            fragment.appendChild(nextNode);
            nextNode = summaryElement.nextSibling;
        }
        const detailsContentElement = document.createElement(__classPrivateFieldGet(this, _detailsContentCustomElementName));
        summaryElement.insertAdjacentElement('afterend', detailsContentElement);
        __classPrivateFieldSet(this, _detailsContentElement, detailsContentElement);
        const contentElement = document.createElement('div');
        contentElement.slot = 'content';
        contentElement.appendChild(fragment);
        detailsContentElement.appendChild(contentElement);
        const open = this.open;
        __classPrivateFieldSet(this, _preOpen, open);
        if (open) {
            this._open();
        }
        else {
            this._close();
        }
        summaryElement.addEventListener('click', __classPrivateFieldGet(this, _summaryClickEventListener));
        summaryElement.addEventListener('mouseenter', __classPrivateFieldGet(this, _summaryMouseEnterEventListener), { passive: true });
        summaryElement.addEventListener('mouseleave', __classPrivateFieldGet(this, _summaryMouseLeaveEventListener), { passive: true });
        detailsContentElement.addEventListener('transitionend', __classPrivateFieldGet(this, _detailsContentTransitionEndEventListener), { passive: true });
    }
    disconnectedCallback() {
        const summaryElement = __classPrivateFieldGet(this, _summaryElement);
        const detailsContentElement = __classPrivateFieldGet(this, _detailsContentElement);
        summaryElement.removeEventListener('click', __classPrivateFieldGet(this, _summaryClickEventListener));
        summaryElement.removeEventListener('mouseenter', __classPrivateFieldGet(this, _summaryMouseEnterEventListener));
        summaryElement.removeEventListener('mouseleave', __classPrivateFieldGet(this, _summaryMouseLeaveEventListener));
        detailsContentElement.removeEventListener('transitionend', __classPrivateFieldGet(this, _detailsContentTransitionEndEventListener));
        window.removeEventListener('resize', __classPrivateFieldGet(this, _windowResizeEventListener));
    }
    /**
     * <summary> 要素をクリックしたときの処理
     *
     * @param {Event} ev - Event
     */
    _summaryClickEvent(ev) {
        ev.preventDefault();
        const preOpen = !__classPrivateFieldGet(this, _preOpen);
        __classPrivateFieldSet(this, _preOpen, preOpen);
        this._toggleSummary();
        if (!__classPrivateFieldGet(this, _animation) && preOpen) {
            this.open = true;
        }
        if (preOpen) {
            this._open();
        }
        else {
            this._close();
        }
        __classPrivateFieldSet(this, _animation, true);
    }
    /**
     * <summary> 要素の表示を切り替える
     */
    _toggleSummary() {
        const summaryToggleHTML = __classPrivateFieldGet(this, _summaryToggleHTML);
        if (summaryToggleHTML !== undefined) {
            const summaryElement = __classPrivateFieldGet(this, _summaryElement);
            __classPrivateFieldSet(this, _summaryToggleHTML, summaryElement.innerHTML);
            summaryElement.textContent = '';
            summaryElement.insertAdjacentHTML('beforeend', summaryToggleHTML);
        }
    }
    /**
     * コンテンツエリアを開く処理
     */
    _open() {
        setTimeout(() => {
            if (__classPrivateFieldGet(this, _supportCSSTypedOM)) {
                __classPrivateFieldGet(this, _detailsContentElement).attributeStyleMap.set('height', CSS.px(__classPrivateFieldGet(this, _detailsContentElement).scrollHeight));
            }
            else {
                __classPrivateFieldGet(this, _detailsContentElement).style.height = `${String(__classPrivateFieldGet(this, _detailsContentElement).scrollHeight)}px`;
            }
        }, 0); // TODO 最初から open 状態の場合、初期状態では高さが正常に取得できないための回避策
        window.addEventListener('resize', __classPrivateFieldGet(this, _windowResizeEventListener), { passive: true });
    }
    /**
     * コンテンツエリアを閉じる処理
     */
    _close() {
        if (__classPrivateFieldGet(this, _supportCSSTypedOM)) {
            __classPrivateFieldGet(this, _detailsContentElement).attributeStyleMap.set('height', '0');
        }
        else {
            __classPrivateFieldGet(this, _detailsContentElement).style.height = '0';
        }
        window.removeEventListener('resize', __classPrivateFieldGet(this, _windowResizeEventListener));
    }
    /**
     * <summary> 要素上にマウスカーソルが入ったときの処理
     */
    _summaryMouseEnterEvent() {
        if (__classPrivateFieldGet(this, _supportCSSTypedOM)) {
            __classPrivateFieldGet(this, _detailsContentElement).attributeStyleMap.set('will-change', 'height');
        }
        else {
            __classPrivateFieldGet(this, _detailsContentElement).style.willChange = 'height';
        }
    }
    /**
     * <summary> 要素上からマウスカーソルが外れたときの処理
     */
    _summaryMouseLeaveEvent() {
        if (__classPrivateFieldGet(this, _supportCSSTypedOM)) {
            __classPrivateFieldGet(this, _detailsContentElement).attributeStyleMap.delete('will-change');
        }
        else {
            __classPrivateFieldGet(this, _detailsContentElement).style.willChange = '';
        }
    }
    /**
     * 開閉アニメーションが終了したときの処理
     */
    _detailsContentTransitionEndEvent() {
        __classPrivateFieldSet(this, _animation, false);
        if (!__classPrivateFieldGet(this, _preOpen)) {
            this.open = false;
        }
    }
    /**
     * ウィンドウサイズを変更した時の処理
     */
    _windowResizeEvent() {
        const timeoutId = __classPrivateFieldGet(this, _windowResizeTimeoutId);
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        __classPrivateFieldSet(this, _windowResizeTimeoutId, setTimeout(() => {
            const detailsContentElement = __classPrivateFieldGet(this, _detailsContentElement);
            if (__classPrivateFieldGet(this, _supportCSSTypedOM)) {
                detailsContentElement.attributeStyleMap.set('height', 'auto');
                detailsContentElement.attributeStyleMap.set('height', CSS.px(detailsContentElement.scrollHeight));
            }
            else {
                detailsContentElement.style.height = 'auto';
                detailsContentElement.style.height = `${String(detailsContentElement.scrollHeight)}px`;
            }
        }, 100));
    }
}
_preOpen = new WeakMap(), _animation = new WeakMap(), _supportCSSTypedOM = new WeakMap(), _summaryElement = new WeakMap(), _summaryToggleHTML = new WeakMap(), _detailsContentElement = new WeakMap(), _detailsContentCustomElementName = new WeakMap(), _windowResizeTimeoutId = new WeakMap(), _summaryClickEventListener = new WeakMap(), _summaryMouseEnterEventListener = new WeakMap(), _summaryMouseLeaveEventListener = new WeakMap(), _detailsContentTransitionEndEventListener = new WeakMap(), _windowResizeEventListener = new WeakMap();
