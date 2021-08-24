export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.subElements = {};
    this.render();
  }

  get getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
         ${this.headerConfig.map((headerItem) => this.getTableHeaderCell(headerItem)).join('')}
      </div>
    `;
  }

  getTableHeaderCell({title}) {
    return `
      <div class="sortable-table__cell" data-id="images" data-sortable="false" data-order="">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getTableCell(dataValue, template) {
    return template ? template(dataValue) : `<div class="sortable-table__cell">${dataValue}</div>`;
  }

  getTableRow(dataRow) {
    const cell = this.headerConfig.map(({id, template}) => this.getTableCell(dataRow[id], template)).join('');
    return `<a class="sortable-table__row">${cell}</a>`;
  }

  get getTableBody() {
    return this.data.map((dataRow) => this.getTableRow(dataRow)).join('');
  }

  get getTable() {
    return `
      <div class="sortable-table">
         ${this.getTableHeader}
         <div class="sortable-table__body" data-role="body">
           ${this.getTableBody}
         </div>
      </div>
    `;
  }

  sort(fieldValue, orderValue = 'asc') {
    const sortedArray = [...this.data];
    const locales = ['ru', 'en'];
    const options = {caseFirst: 'upper'};
    const direction = {
      'asc': 1,
      'desc': -1
    };
    const sortFunctions = {
      'number': (a, b) => a - b,
      'string': (a, b) => a.localeCompare((b), locales, options)
    };
    const sortType = this.headerConfig.find((headerValue) => headerValue.id === fieldValue).sortType;
    sortedArray.sort((a, b) => direction[orderValue] * sortFunctions[sortType](a[fieldValue], b[fieldValue]));
    this.update(sortedArray);
  }

  update(sortedData) {
    this.data = sortedData;
    if (!this.subElements.body) {
      this.subElements.body = document.querySelector('[data-role="body"]');
    }

    this.subElements.body.innerHTML = this.getTableBody;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable;
    this.element = element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
