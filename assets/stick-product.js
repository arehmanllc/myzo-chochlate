class StickyProduct extends HTMLElement {
  constructor() {
    super();
    this.selectors = {
      addToCartBtn: '[add-to-cart]',
      container: '.st-prod',
      addToCartMain: `#ProductSubmitButton-${this.dataset.id}`,
      productInfo: 'product-info'
    };
    this.isButtonVisible = true;
    this.init();
  }

  init() {
    this.addToCartBtn = this.querySelector(this.selectors.addToCartBtn);
    this.addToCartMain = document.querySelector(this.selectors.addToCartMain);
    this.container = this.querySelector(this.selectors.container);
    this.productInfo = document.querySelector(this.selectors.productInfo);
    this.addToCartBtn?.addEventListener('click', () => {
      this.scrollToBtn();
    });
    window.addEventListener('scroll', () => {
      this.checkButtonVisibility();
    });
    document.addEventListener('DOMContentLoaded', this.checkButtonVisibility.bind(this));
  }

  checkButtonVisibility() {
    const buttonRect = this.addToCartMain.getBoundingClientRect();
    // console.log(buttonRect);
    if (buttonRect.bottom <= 0) {
      if (this.isButtonVisible) {
        this.isButtonVisible = false;
        this.showStickyProduct();
      }
    } else {
      if (!this.isButtonVisible) {
        this.isButtonVisible = true;
        this.hideStickyProduct();
      }
    }
  }

  showStickyProduct() {
    if (this.container && !this.container.classList.contains('active')) {
      this.container.classList.add('active');
    }
  }

  hideStickyProduct() {
    if (this.container && this.container.classList.contains('active')) {
      this.container.classList.remove('active');
    }
  }
  scrollToBtn() {
    if (this.addToCartMain && this.productInfo) {
      this.productInfo.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      if (!this.addToCartMain.disabled) {
        this.addToCartMain.click();
      }
    }
  }
}
customElements.define('sticky-product', StickyProduct);
