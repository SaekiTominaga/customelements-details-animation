/**
 * Animate the opening or closing process of the <details> element by Custom Elements.
 */
export default class DetailsAnimation extends HTMLDetailsElement {
	#animation: Animation | null = null;

	#keyframeAnimationOptions: KeyframeAnimationOptions = {
		duration: 500,
		easing: 'ease',
	}; // https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#parameters

	readonly #supportCssTypedOM: boolean; // CSS Typed Object Model に対応しているか https://caniuse.com/mdn-api_element_attributestylemap

	#summaryElement: HTMLElement | null = null; // <summary> 要素
	#summaryToggleHtml: string | undefined; // <summary> 要素内のテキスト（HTML）
	#detailsContentElement: HTMLDivElement | null = null; // <details> 要素内の <summary> 要素を除くコンテンツを囲う要素

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

		this.#summaryToggleHtml = this.dataset.summaryToggle;

		if (this.#supportCssTypedOM) {
			this.attributeStyleMap.set('overflow', 'hidden');
		} else {
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
		if (this.#supportCssTypedOM) {
			detailsContentElement.attributeStyleMap.set('display', 'flex'); // margin の相殺を避けるために Block formatting context を生成
		} else {
			detailsContentElement.style.display = 'flex';
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
			const height = this.offsetHeight;

			if (this.#supportCssTypedOM) {
				this.attributeStyleMap.set('height', CSS.px(height));
			} else {
				this.style.height = `${height}px`;
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
		if (summaryToggleHtml !== undefined) {
			const summaryElement = <HTMLElement>this.#summaryElement;

			this.#summaryToggleHtml = summaryElement.innerHTML;
			summaryElement.innerHTML = summaryToggleHtml;
		}
	}

	/**
	 * コンテンツエリアを開く処理
	 */
	private _open(): void {
		const detailsHeight = this.offsetHeight;

		this.open = true;

		const summaryHeight = (<HTMLElement>this.#summaryElement).offsetHeight;
		const detailsContentHeight = (<HTMLElement>this.#detailsContentElement).offsetHeight;

		this.#animation = this.animate(
			{
				height: [`${detailsHeight}px`, `${summaryHeight + detailsContentHeight}px`],
			},
			this.#keyframeAnimationOptions
		);

		this.#animation.onfinish = () => {
			if (this.#supportCssTypedOM) {
				this.attributeStyleMap.delete('height');
			} else {
				this.style.height = '';
			}
		};
	}

	/**
	 * コンテンツエリアを閉じる処理
	 */
	private _close(): void {
		const detailsHeight = this.offsetHeight;
		const summaryHeight = (<HTMLElement>this.#summaryElement).offsetHeight;

		this.#animation = this.animate(
			{
				height: [`${detailsHeight}px`, `${summaryHeight}px`],
			},
			this.#keyframeAnimationOptions
		);

		this.#animation.onfinish = () => {
			this.open = false;

			if (this.#supportCssTypedOM) {
				this.attributeStyleMap.delete('height');
			} else {
				this.style.height = '';
			}
		};
	}
}
