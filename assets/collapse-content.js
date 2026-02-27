if (!customElements.get('collapse-content')) {
  class CollapseContent extends HTMLElement {
    constructor() {
      super();
      this.initCl();
    }

    initCl() {
      this.collapseBtn = this.querySelector('button');
      this.collapseExpand = this.querySelector('[collapse-content]');
      this.collapseEvent();
    }

    collapseEvent() {
      this.collapseBtn.addEventListener('click', () => {
        if (this.collapseExpand.classList.contains('active')) {
          this.collapseBtn.classList.remove('active');
          this.collapseExpand.classList.remove('active');

          this.collapseExpand.closest('.collapse')?.classList.remove('active');
          this.collapseExpand.style.maxHeight = '0px';
        } else {
          this.collapseExpand.classList.add('active');
          this.collapseBtn.classList.add('active');
          this.collapseExpand.closest('.collapse')?.classList.add('active');
          this.collapseExpand.style.maxHeight = this.collapseExpand.scrollHeight + 40 + 'px';
        }
      });
    }

  }
  customElements.define('collapse-content', CollapseContent);
}
