export default class SortableTable {
  constructor(headerConfig, {
    data = [],
    sorted = {},
    isSortLocally = true
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.subElements = {};
    this.listeners = [];
    this.sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc',
      ...sorted
    };
    this.isSortLocally = isSortLocally;

    this.render();
  }

  get getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
         ${this.headerConfig.map((headerItem) => this.getTableHeaderCell(headerItem)).join('')}
      </div>
    `;
  }

  getTableHeaderCell({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  sortSelectedCell = (id) => () => {
    if (this.sorted.id === id) {
      this.sorted.order = this.sorted.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sorted.id = id;
      this.sorted.order = 'desc';
    }
    this.sort();
  };

  initClickListener = (element) => {
    const sortHandler = this.sortSelectedCell(element.getAttribute('data-id'));
    element.addEventListener('pointerdown', sortHandler);
    this.listeners.push({
      element, sortHandler
    });
  };

  addEventListeners() {
    this.element
      .querySelectorAll('[data-id][data-sortable="true"]')
      .forEach(elem => this.initClickListener(elem));
  }

  get getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
      </div>`;
  }

  getTableRows(dataRows) {
    return dataRows.map(dataRow => {
      return `
        <a href="/products/${dataRow.id}" class="sortable-table__row">
          ${this.getTableRow(dataRow)}
        </a>`;
    }).join('');
  }

  getTableRow(dataRow) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(dataRow[id])
        : `<div class="sortable-table__cell">${dataRow[id]}</div>`;
    }).join('');
  }

  get getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader}
        ${this.getTableBody}
      </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable;
    this.element = element.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    this.addEventListeners();
    this.sort();
  }

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient() {
    const field = this.sorted.id;
    const order = this.sorted.order;
    const sortedData = this.sortData(field, order);
    const columns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    columns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortOnServer() {

  }

  sortData(fieldValue, orderValue) {
    const sortedArray = [...this.data];
    const locales = ['ru', 'en'];
    const options = {caseFirst: 'upper'};
    const sortType = this.headerConfig.find(headerValue => headerValue.id === fieldValue).sortType;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[orderValue];

    return sortedArray.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[fieldValue] - b[fieldValue]);
      case 'string':
        return direction * a[fieldValue].localeCompare(b[fieldValue], locales, options);
      default:
        return direction * (a[fieldValue] - b[fieldValue]);
      }
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.listeners.forEach(item => {
      item.element.removeEventListener('pointerdown', item.sortHandler);
    });
  }
}
