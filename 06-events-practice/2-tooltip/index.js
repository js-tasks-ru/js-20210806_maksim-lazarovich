class Tooltip {
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  onPointerMove = event => {
    this.getTooltipPosition(event);
  };

  onPointerOver = event => {
    const dataElement = event.target.closest('[data-tooltip]');

    if (dataElement) {
      this.render(dataElement.dataset.tooltip);
      this.getTooltipPosition(event);

      document.addEventListener('pointermove', this.onPointerMove);
    }
  };

  onPointerOut = () => {
    this.removeTooltip();
  };

  getTooltipPosition(event) {
    const top = event.clientY + 10;
    const left = event.clientX + 10;
    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
  }

  render(content) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = content;
    document.body.append(this.element);
  }

  addEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  initialize() {
    this.addEventListeners();
  }

  removeTooltip() {
    if (this.element) {
      this.element.remove();
      this.element = null;

      document.removeEventListener('pointermove', this.onPointerMove);
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    this.removeTooltip();
  }
}

export default Tooltip;
