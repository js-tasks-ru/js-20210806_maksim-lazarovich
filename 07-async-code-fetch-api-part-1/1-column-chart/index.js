const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ColumnChart {
  subElements = {};

  constructor({
    data = [],
    url = '/',
    label = '',
    value = 0,
    formatHeading = (value) => value,
    link = '',
    range = {}
  } = {}) {

    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;
    this.url = url;
    this.range = range;

    this.render();
  }

  getBody(data) {
    const selectedData = Object.values(data);
    const maxValue = Math.max(...selectedData);
    const scale = 50 / maxValue;

    return selectedData.map((item) => {
      const value = String(Math.floor(item * scale));
      const percent = (item / maxValue * 100).toFixed(0) + '%';

      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join('');
  }

  get getColumnChartLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  get getColumnChart() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getColumnChartLink}
      </div>
      <div class="column-chart__container">
         <div data-element="header" class="column-chart__header">
         </div>
        <div data-element="body" class="column-chart__chart">
          ${this.getBody(this.data)}
        </div>
      </div>
    </div>
    `;
  }

  async getData() {
    const url = new URL(this.url, BACKEND_URL);
    if (this.range.from) {
      url.searchParams.append('from', this.range.from);
    }
    if (this.range.to) {
      url.searchParams.append('to', this.range.to);
    }
    const result = await fetch(url.toString());
    return result.json();
  }

  async load() {
    this.data = await this.getData();
    this.totalSales = Object.values(this.data).reduce((sum, current) => sum + current, 0);
    this.subElements.body.innerHTML = this.getBody(this.data);
    this.subElements.header.innerHTML = this.formatHeading(this.totalSales);

    if (Object.values(this.data).length) {
      this.element.classList.remove('column-chart_loading');
    }
    return this.data;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getColumnChart;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    await this.load();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements]
      .reduce(
        (acc, elem) => ({
          ...acc,
          [elem.dataset.element]: elem
        }),
        {}
      );
  }

  async update(from = this.range.from, to = this.range.to) {
    this.range = {from, to};
    await this.load();
    return this.data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
