export default class ColumnChart {
  constructor(objData = {}) {
    this.data = objData.data || [],
    this.label = objData.label || "",
    this.value = objData.value || "",
    this.link = objData.link || "",
    this.formatHeading = objData.formatHeading;

    this.chartHeight = 50;
    this.render();
  }

  getColumnChartLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  formatHeaderValue() {
    return this.formatHeading ? this.formatHeading(this.value) : this.value;
  }

  get getColumnChart() {
    return `
    <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getColumnChartLink()}
      </div>
      <div class="column-chart__container">
         <div data-element="header" class="column-chart__header">
           ${this.formatHeaderValue()}
         </div>
        <div data-element="body" class="column-chart__chart">
          ${this.getBody(this.data)}
        </div>
      </div>
    </div>
    `;
  }

  getBody(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map((item) => {
      const value = String(Math.floor(item * scale));
      const percent = (item / maxValue * 100).toFixed(0) + '%';

      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join('');
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getColumnChart;
    this.element = element.firstElementChild;

    if (!this.data.length) {
      this.element.classList.add('column-chart_loading');
    }
  }

  update() {
    if (!this.data.length) {
      this.element.classList.add('column-chart_loading');
      return;
    }

    const dataBody = this.element.querySelector(".column-chart__chart");

    dataBody.append(this.getBody(this.data));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
