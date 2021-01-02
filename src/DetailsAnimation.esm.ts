/**
 * Animate the opening or closing process of the <details> element by Custom Elements.
 *
 * @version 1.2.0
 */
export default class DetailsAnimation extends HTMLDetailsElement {
	#preOpen = false; // アニメーションの実現のため本来の open 属性の反映タイミングは実際とは変えており、開閉処理が始まった瞬間の状態をこの変数に記録する
	#animation = false; // アニメーション中かどうか

	#supportCSSTypedOM: boolean; // CSS Typed Object Model に対応しているか https://caniuse.com/mdn-api_element_attributestylemap

	#summaryElement: HTMLElement | null = null;
	#summaryToggleHTML: string | undefined;

	#detailsContentElement: HTMLElement | null = null; // <details> 要素内の <summary> 要素を除くコンテンツを囲う要素
	#detailsContentCustomElementName = 'x-details-animation-content'; // <details> 要素内の <summary> 要素を除くコンテンツを囲う要素の名前

	#detailsContentResizeObserver: ResizeObserver | null = null;

	#summaryClickEventListener: (ev: Event) => void;
	#summaryMouseEnterEventListener: () => void;
	#summaryMouseLeaveEventListener: () => void;
	#detailsContentTransitionEndEventListener: () => void;
	#windowResizeEventListener: () => void;

	#windowResizeTimeoutId: NodeJS.Timeout | null = null; // window.onresize のタイマーの識別 ID（clearTimeout() で使用）

	constructor() {
		super();

		this.#supportCSSTypedOM = this.attributeStyleMap !== undefined;

		this.#summaryClickEventListener = this._summaryClickEvent.bind(this);
		this.#summaryMouseEnterEventListener = this._summaryMouseEnterEvent.bind(this);
		this.#summaryMouseLeaveEventListener = this._summaryMouseLeaveEvent.bind(this);
		this.#detailsContentTransitionEndEventListener = this._detailsContentTransitionEndEvent.bind(this);
		this.#windowResizeEventListener = this._windowResizeEvent.bind(this);
	}

	connectedCallback(): void {
		const summaryElement = this.querySelector('summary');
		if (summaryElement === null) {
			throw new Error('Element <details> is missing a required instance of child element <summary>.');
		}
		this.#summaryElement = summaryElement;

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
			this.#detailsContentCustomElementName = detailsContentCustomElementName;
		}

		this.#summaryToggleHTML = this.dataset.summaryToggle;

		/* <summary> を除くノードを <div> でラップする */
		const fragment = document.createDocumentFragment();
		let nextNode = summaryElement.nextSibling;
		while (nextNode !== null) {
			fragment.appendChild(nextNode);
			nextNode = summaryElement.nextSibling;
		}

		const detailsContentElement = document.createElement(this.#detailsContentCustomElementName);
		summaryElement.insertAdjacentElement('afterend', detailsContentElement);
		this.#detailsContentElement = detailsContentElement;

		const contentElement = document.createElement('div');
		contentElement.slot = 'content';
		contentElement.appendChild(fragment);
		detailsContentElement.appendChild(contentElement);

		if (window.ResizeObserver !== undefined) {
			this.#detailsContentResizeObserver = new ResizeObserver(() => {
				this._detailContentResize();
			});
		}

		const open = this.open;
		this.#preOpen = open;
		if (open) {
			this._open();

			if (this.#detailsContentResizeObserver !== null) {
				this.#detailsContentResizeObserver.observe(detailsContentElement);
			} else {
				window.addEventListener('resize', this.#windowResizeEventListener, { passive: true });
			}
		} else {
			this._close();
		}

		summaryElement.addEventListener('click', this.#summaryClickEventListener);
		summaryElement.addEventListener('mouseenter', this.#summaryMouseEnterEventListener, { passive: true });
		summaryElement.addEventListener('mouseleave', this.#summaryMouseLeaveEventListener, { passive: true });
		detailsContentElement.addEventListener('transitionend', this.#detailsContentTransitionEndEventListener, { passive: true });
	}

	disconnectedCallback(): void {
		const summaryElement = <HTMLElement>this.#summaryElement;
		const detailsContentElement = <HTMLElement>this.#detailsContentElement;

		summaryElement.removeEventListener('click', this.#summaryClickEventListener);
		summaryElement.removeEventListener('mouseenter', this.#summaryMouseEnterEventListener);
		summaryElement.removeEventListener('mouseleave', this.#summaryMouseLeaveEventListener);
		detailsContentElement.removeEventListener('transitionend', this.#detailsContentTransitionEndEventListener);
		window.removeEventListener('resize', this.#windowResizeEventListener);
	}

	/**
	 * <summary> 要素をクリックしたときの処理
	 *
	 * @param {Event} ev - Event
	 */
	private _summaryClickEvent(ev: Event): void {
		ev.preventDefault();

		const preOpen = !this.#preOpen;
		this.#preOpen = preOpen;
		this._toggleSummary();

		if (!this.#animation && preOpen) {
			this.open = true;
		}

		if (preOpen) {
			this._open();
		} else {
			this._close();
		}

		this.#animation = true;
	}

	/**
	 * <summary> 要素の表示を切り替える
	 */
	private _toggleSummary(): void {
		const summaryToggleHTML = this.#summaryToggleHTML;
		if (summaryToggleHTML !== undefined) {
			const summaryElement = <HTMLElement>this.#summaryElement;

			this.#summaryToggleHTML = summaryElement.innerHTML;
			summaryElement.textContent = '';
			summaryElement.insertAdjacentHTML('beforeend', summaryToggleHTML);
		}
	}

	/**
	 * コンテンツエリアを開く処理
	 */
	private _open(): void {
		const detailsContentElement = <HTMLElement>this.#detailsContentElement;

		setTimeout(() => {
			if (this.#supportCSSTypedOM) {
				detailsContentElement.attributeStyleMap.set('height', CSS.px(detailsContentElement.scrollHeight));
			} else {
				detailsContentElement.style.height = `${String(detailsContentElement.scrollHeight)}px`;
			}
		}, 0); // TODO 最初から open 状態の場合、初期状態では高さが正常に取得できないための回避策
	}

	/**
	 * コンテンツエリアを閉じる処理
	 */
	private _close(): void {
		const detailsContentElement = <HTMLElement>this.#detailsContentElement;

		if (this.#supportCSSTypedOM) {
			detailsContentElement.attributeStyleMap.set('height', '0');
		} else {
			detailsContentElement.style.height = '0';
		}

		if (this.#detailsContentResizeObserver !== null) {
			this.#detailsContentResizeObserver.unobserve(detailsContentElement);
		} else {
			window.removeEventListener('resize', this.#windowResizeEventListener);
		}
	}

	/**
	 * <summary> 要素上にマウスカーソルが入ったときの処理
	 */
	private _summaryMouseEnterEvent(): void {
		if (this.#supportCSSTypedOM) {
			(<HTMLElement>this.#detailsContentElement).attributeStyleMap.set('will-change', 'height');
		} else {
			(<HTMLElement>this.#detailsContentElement).style.willChange = 'height';
		}
	}

	/**
	 * <summary> 要素上からマウスカーソルが外れたときの処理
	 */
	private _summaryMouseLeaveEvent(): void {
		if (this.#supportCSSTypedOM) {
			(<HTMLElement>this.#detailsContentElement).attributeStyleMap.delete('will-change');
		} else {
			(<HTMLElement>this.#detailsContentElement).style.willChange = '';
		}
	}

	/**
	 * 開閉アニメーションが終了したときの処理
	 */
	private _detailsContentTransitionEndEvent(): void {
		this.#animation = false;

		if (!this.#preOpen) {
			this.open = false;
		} else {
			if (this.#detailsContentResizeObserver !== null) {
				this.#detailsContentResizeObserver.observe(<HTMLElement>this.#detailsContentElement);
			} else {
				window.addEventListener('resize', this.#windowResizeEventListener, { passive: true });
			}
		}
	}

	/**
	 * ウィンドウサイズを変更した時の処理（ResizeObserver API 未対応ブラウザ）
	 */
	private _windowResizeEvent(): void {
		const timeoutId = this.#windowResizeTimeoutId;
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		this.#windowResizeTimeoutId = setTimeout(() => {
			this._detailContentResize();
		}, 100);
	}

	/**
	 * コンテンツエリアの矩形が変化した時の処理
	 */
	private _detailContentResize(): void {
		const detailsContentElement = <HTMLElement>this.#detailsContentElement;

		if (this.#supportCSSTypedOM) {
			detailsContentElement.attributeStyleMap.set('height', 'auto');
			detailsContentElement.attributeStyleMap.set('height', CSS.px(detailsContentElement.scrollHeight));
		} else {
			detailsContentElement.style.height = 'auto';
			detailsContentElement.style.height = `${String(detailsContentElement.scrollHeight)}px`;
		}
	}
}
