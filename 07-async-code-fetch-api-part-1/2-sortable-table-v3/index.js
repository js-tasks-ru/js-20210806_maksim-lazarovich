const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor(headerConfig, {
    data = [],
    sorted = {},
    url = '',
    isSortLocally = false
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.subElements = {};
    this.listeners = [];
    this.visibleRows = 0;
    this.sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc',
      ...sorted
    };
    this.isSortLocally = isSortLocally;
    this.url = url;

    this.render();
  }

  get getTableHeader() {
    return `
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(headerItem => this.getTableHeaderCell(headerItem)).join('')}
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
    document.addEventListener('scroll', this.scrollHandler);
  }

  get getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
      </div>`;
  }

  getTableRows(dataRows) {
    return dataRows.map(dataRows => {
      return `
        <a href="/products/${dataRows.id}" class="sortable-table__row">
          ${this.getTableRow(dataRows)}
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
        <div id="scrollTrigger"></div>
      </div>`;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable;
    this.element = element.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    this.addEventListeners();
    await this.sort();
    this.scrollTrigger = element.querySelector('#scrollTrigger');
  }

  async sort() {
    this.visibleRows = 0;
    const [id, order] = [this.sorted.id, this.sorted.order];

    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      await this.sortOnServer(id, order);
    }
  }

  getData = async (id, order, visibleRows = 0) => {
    const url = new URL(this.url, BACKEND_URL);
    if (id) {
      url.searchParams.append('_sort', id);
    }
    if (order) {
      url.searchParams.append('_order', order);
    }
    url.searchParams.append('_start', visibleRows);
    url.searchParams.append('_end', visibleRows + 30);
    return (await fetch(url.toString())).json();
  };

  scrollHandler = async () => {
    if (this.scrollTrigger.getClientRects()[0].top < 1000 && !this.isLoading) {
      this.isLoading = true;
      const id = this.sorted.id;
      const order = this.sorted.order;
      this.visibleRows += 30;
      const scrollData = await this.getData(id, order, this.visibleRows);
      this.sortedData = [...this.sortedData, ...scrollData];
      this.updateData(this.sortedData, id, order);
      this.isLoading = false;
    }
  };

  sortOnServer = async (id, order) => {
    this.sortedData = await this.getData(id, order);
    this.updateData(this.sortedData, id, order);
  };

  sortOnClient = (id, order) => {
    this.sortedData = this.sortData(id, order);
    this.updateData(this.sortedData, id, order);
  };

  updateData = (data, id, order) => {
    const columns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);

    columns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
    this.subElements.body.innerHTML = this.getTableRows(data);
  };

  sortData(id, order) {
    const sortedArray = [...this.data];
    const locales = ['ru', 'en'];
    const options = {caseFirst: 'upper'};
    const sortType = this.headerConfig.find(headerValue => headerValue.id === id).sortType;

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return sortedArray.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], locales, options);
      default:
        return direction * (a[id] - b[id]);
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
    document.removeEventListener('scroll', this.scrollHandler);
  }
}
