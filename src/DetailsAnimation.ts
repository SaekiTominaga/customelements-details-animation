/**
 * Animate the opening or closing process of the <details> element by Custom Elements.
 */
export default class DetailsAnimation extends HTMLDetailsElement {
	readonly #supportCssTypedOM: boolean; // CSS Typed Object Model に対応しているか https://caniuse.com/mdn-api_element_attributestylemap

	#animation: Animation | null = null;

	#keyframeAnimationOptions: KeyframeAnimationOptions = {
		duration: 500,
		easing: 'ease',
	}; // https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#parameters

	#summaryElement: HTMLElement | null = null; // <summary> 要素
	#summaryToggleHtml: string | null = null; // <summary> 要素内のテキスト（HTML）

	#detailsContentElement: HTMLDivElement | null = null; // <details> 要素内の <summary> 要素を除くコンテンツを囲う要素
	#detailsContentHeight: number | null = null; // コンテンツを囲う要素の高さ

	readonly #summaryClickEventListener: (ev: Event) => void;

	constructor() {
		super();

		this.#supportCssTypedOM = this.attributeStyleMap !== undefined;

		this.#summaryClickEventListener = this._summaryClickEvent.bind(this);
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

		this.dataset.preOpen = String(this.open);

		const duration = this.dataset.duration;
		if (duration !== undefined) {
			this.#keyframeAnimationOptions.duration = Number(duration);
		}
		const easing = this.dataset.easing;
		if (easing !== undefined) {
			this.#keyframeAnimationOptions.easing = easing;
		}

		this.#summaryToggleHtml = this.dataset.summaryToggle ?? null;

		/* <summary> を除くノードをラップする */
		const fragment = document.createDocumentFragment();
		let nextNode = summaryElement.nextSibling;
		while (nextNode !== null) {
			fragment.appendChild(nextNode);
			nextNode = summaryElement.nextSibling;
		}

		const detailsContentElement = document.createElement('div');
		if (this.#supportCssTypedOM) {
			detailsContentElement.attributeStyleMap.set('overflow', 'hidden');
		} else {
			detailsContentElement.style.overflow = 'hidden';
		}
		detailsContentElement.appendChild(fragment);
		summaryElement.insertAdjacentElement('afterend', detailsContentElement);
		this.#detailsContentElement = detailsContentElement;

		summaryElement.addEventListener('click', this.#summaryClickEventListener);
	}

	disconnectedCallback(): void {
		const summaryElement = <HTMLElement>this.#summaryElement;

		summaryElement.removeEventListener('click', this.#summaryClickEventListener);
	}

	/**
	 * <summary> 要素をクリックしたときの処理
	 *
	 * @param {Event} ev - Event
	 */
	private _summaryClickEvent(ev: Event): void {
		ev.preventDefault();

		const preOpen = this.dataset.preOpen !== 'true';
		this.dataset.preOpen = String(preOpen);

		this._toggleSummaryText();

		if (this.#animation?.playState === 'running') {
			/* アニメーションが終わらないうちに連続して <summary> がクリックされた場合 */
			const detailsContentElement = <HTMLElement>this.#detailsContentElement;
			const height = detailsContentElement.offsetHeight;

			if (this.#supportCssTypedOM) {
				detailsContentElement.attributeStyleMap.set('height', CSS.px(height));
			} else {
				detailsContentElement.style.height = `${height}px`;
			}

			this.#animation.cancel();
		}

		if (preOpen) {
			this._open();
		} else {
			this._close();
		}
	}

	/**
	 * <summary> 要素内のテキスト表示を切り替える
	 */
	private _toggleSummaryText(): void {
		const summaryToggleHtml = this.#summaryToggleHtml;
		if (summaryToggleHtml !== null) {
			const summaryElement = <HTMLElement>this.#summaryElement;

			this.#summaryToggleHtml = summaryElement.innerHTML;
			summaryElement.innerHTML = summaryToggleHtml;
		}
	}

	/**
	 * コンテンツエリアを開く処理
	 */
	private _open(): void {
		const detailsContentElement = <HTMLElement>this.#detailsContentElement;

		const startHeight = detailsContentElement.offsetHeight;

		this.open = true;

		const endHeight = this.#detailsContentHeight ?? detailsContentElement.offsetHeight;

		this.#animation = detailsContentElement.animate(
			{
				height: [`${startHeight}px`, `${endHeight}px`],
			},
			this.#keyframeAnimationOptions
		);

		this.#animation.onfinish = () => {
			this.#detailsContentHeight = detailsContentElement.offsetHeight;

			if (this.#supportCssTypedOM) {
				detailsContentElement.attributeStyleMap.delete('height');
			} else {
				detailsContentElement.style.height = '';
			}
		};
	}

	/**
	 * コンテンツエリアを閉じる処理
	 */
	private _close(): void {
		const detailsContentElement = <HTMLElement>this.#detailsContentElement;

		const startHeight = detailsContentElement.offsetHeight;
		this.#detailsContentHeight = startHeight;

		this.#animation = detailsContentElement.animate(
			{
				height: [`${startHeight}px`, '0px'],
			},
			this.#keyframeAnimationOptions
		);

		this.#animation.onfinish = () => {
			this.open = false;

			this.#detailsContentHeight = null;

			if (this.#supportCssTypedOM) {
				detailsContentElement.attributeStyleMap.delete('height');
			} else {
				detailsContentElement.style.height = '';
			}
		};
	}
}
