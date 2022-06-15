const urls = {
  smallDataTable:
    'http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&adress={addressObject}&description={lorem|32}',
  bigDataTable:
    'http://www.filltext.com/?rows=1000&id={number|1000}&firstName={firstName}&delay=3&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&adress={addressObject}&description={lorem|32}',
};
// Запрос данных с сервера
let dataTable = [];
// Ключ объекта
let lastSelectedValueKeyDataTable = null;

async function getData(urls) {
  const response = await fetch(urls);
  dataTable = await response.json();
  return dataTable; //массив данных это конец операции!!!
}

//Создаём таблицу

function renderTable(parent, dataTable) {
  const table = document.createElement('table');
  table.classList.add('table_sort');
  //tableHeader
  const thead = document.createElement('thead');
  table.appendChild(thead); // thead добавляем в table
  const trHead = document.createElement('tr');
  thead.appendChild(trHead);

  for (let i = 0; i < Object.keys(dataTable[0]).length; i++) {
    const th = document.createElement('th');
    const propertyName = Object.keys(dataTable[0])[i];
    th.innerHTML = propertyName; // обращаемся к ключам отдельно взятого объета
    if (
      propertyName === 'id' ||
      propertyName === 'firstName' ||
      propertyName === 'lastName' ||
      propertyName === 'email' ||
      propertyName === 'phone'
    ) {
      trHead.appendChild(th);
    }
    th.setAttribute('data-type', Object.keys(dataTable[0])[i]);
  }
  // Рендерим тело таблицы, через цикл добавляем в ячейки td нужную информацию
  let tbody = document.createElement('tbody');
  table.appendChild(tbody);
  for (let i = 0; i < dataTable.length; i++) {
    const tr = document.createElement('tr');
    // рендерит td
    for (let j = 0; j < Object.keys(dataTable[i]).length; j++) {
      // Object.keys(obj) перебираем св-ва объекта
      const td = document.createElement('td');
      const propertyName = Object.keys(dataTable[i])[j];
      td.innerHTML = dataTable[i][propertyName];
      if (
        propertyName === 'id' ||
        propertyName === 'firstName' ||
        propertyName === 'lastName' ||
        propertyName === 'email' ||
        propertyName === 'phone'
      ) {
        // добавляет td в tr
        tr.appendChild(td);
      }
    }
    // добавляет tr в тело таблицы
    tbody.appendChild(tr);
  }

  parent.appendChild(table);

  tableSort();
}

// Сортировка

function tableSort() {
  const tableHeader = document.querySelector('thead');

  tableHeader.addEventListener('click', (e) => {
    const table = document.querySelector('table.table_sort');
    table.remove(); // вне зависимости от условий таблицу нужно удалить
    const selectedValueKeyDataTable =
      e.target.attributes['data-type'].nodeValue;
    if (selectedValueKeyDataTable !== lastSelectedValueKeyDataTable) {
      if (selectedValueKeyDataTable === 'id') {
        dataTable = dataTable.sort(function (a, b) {
          return a.id - b.id;
        });
      } else if (selectedValueKeyDataTable !== 'id') {
        dataTable = dataTable.sort(function (a, b) {
          let nameA = a[selectedValueKeyDataTable].toLowerCase(),
            nameB = b[selectedValueKeyDataTable].toLowerCase();
          if (nameA < nameB)
            //сортируем строки по возрастанию
            return -1;
          if (nameA > nameB) return 1;
          return 0; // Никакой сортировки
        });
      }
    } else {
      dataTable = dataTable.reverse();
    }
    const elem = document.querySelector('#elem');
    renderTable(elem, dataTable);
    lastSelectedValueKeyDataTable = selectedValueKeyDataTable;
    tableInfo();
  });
  const preloader =
    document.querySelector('.preloader'); /* находим блок Preloader */
  preloader.classList.add(
    'preloader_hidden'
  ); /* добавляем ему класс для скрытия */
}

//Поиск

function tableSearch() {
  const input = document.querySelector('#input');
  input.oninput = function (e) {
    const value = e.target.value.trim().toUpperCase();
    const list = document.querySelectorAll('tbody tr');

    if (value !== '') {
      list.forEach((elem) => {
        if (elem.innerText.toUpperCase().search(value) === -1) {
          elem.classList.add('hide');
        }
      });
    } else {
      list.forEach((elem) => {
        elem.classList.remove('hide');
      });
    }
  };
}

// Пагинация

function createPagination(notesOnPage) {
  const pagination = document.querySelector('#pagination');

  const numberOfPaginationButton = Math.ceil(dataTable.length / notesOnPage);

  const items = [];
  for (let i = 1; i <= numberOfPaginationButton; i++) {
    const li = document.createElement('li');
    li.innerHTML = i;
    pagination.appendChild(li);
    items.push(li);
  }
  // режем массив

  const dataTableSlice = dataTable.slice(0, notesOnPage);

  const table = document.querySelector('#elem');
  renderTable(table, dataTableSlice);

  pagination.addEventListener('click', (e) => {
    const table = document.querySelector('table.table_sort');
    const pageNumLiMass = document.querySelectorAll('#pagination li');

    const clickedLi = e.target.innerHTML;

    pageNumLiMass.forEach(function (liPage) {
      liPage.classList.remove('active');
      if (clickedLi === liPage.innerHTML) {
        liPage.classList.add('active');
      }
    });

    const pageNum = parseInt(clickedLi);

    const start = (pageNum - 1) * notesOnPage;
    const end = start + notesOnPage;

    const dataTableSlice = dataTable.slice(start, end);

    table.remove();
    renderTable(elem, dataTableSlice);
    tableInfo();
  });
}

// модальное окно

function tableInfo() {
  const tableInfoTr = document.querySelector('tbody');

  tableInfoTr.addEventListener('click', (e) => {
    const info = document.querySelector('.info');
    info.classList.add('info_style');
    while (info.children.length) {
      info.removeChild(info.lastChild);
    }
    const clickedTr = e.target.closest('tr');
    const clickedId = parseInt(clickedTr.children[0].innerHTML);

    const dataModal = dataTable.find((item) => item.id === clickedId);

    const pAdress = document.createElement('p');
    const pDesc = document.createElement('p');

    info.appendChild(pAdress);
    info.appendChild(pDesc);
    pDesc.innerHTML = dataModal.description;
    pAdress.innerHTML = Object.values(dataModal.adress);

    //кнопка закрытия окна

    const btnCloses = document.createElement('button');

    btnCloses.innerText = 'OK';
    info.appendChild(btnCloses);

    btnCloses.addEventListener('click', (e) => {
      const info = document.querySelector('.info');
      while (info.children.length) {
        info.removeChild(info.lastChild);
      }
      const infoStyle = document.querySelector('.info_style');
      infoStyle.classList.remove('info_style');
      console.log(e);
    });
  });
}

async function render(urls) {
  await getData(urls);
  createPagination(50);
  tableInfo();
  tableSearch();
}

const buttons = document.querySelectorAll('button');
const littleDataTable = document.getElementById('small_data');
const bigDataTable = document.getElementById('big_data');

function handleClickSmall() {
  littleDataTable.remove();
  bigDataTable.remove();
  render(urls.smallDataTable);

  // Прелоадер
  const divPreloader = document.createElement('div');
  divPreloader.classList.add('preloader');
  const body = document.querySelector('body');
  body.appendChild(divPreloader);
  const divSkChase = document.createElement('div');
  divSkChase.classList.add('sk-chase');
  divPreloader.appendChild(divSkChase);
  const divSkChaseDot = document.createElement('div');
  divSkChaseDot.classList.add('sk-chase-dot');
  divSkChase.appendChild(divSkChaseDot);
  window.addEventListener('load', () => {
    /* Страница загружена, включая все ресурсы */
  });
}

function handleClickBig() {
  littleDataTable.remove();
  bigDataTable.remove();
  render(urls.bigDataTable);

  // Прелоадер
  const divPreloader = document.createElement('div');
  divPreloader.classList.add('preloader');
  const body = document.querySelector('body');
  body.appendChild(divPreloader);
  const divSkChase = document.createElement('div');
  divSkChase.classList.add('sk-chase');
  divPreloader.appendChild(divSkChase);
  const divSkChaseDot = document.createElement('div');
  divSkChaseDot.classList.add('sk-chase-dot');
  divSkChase.appendChild(divSkChaseDot);
  window.addEventListener('load', () => {
    /* Страница загружена, включая все ресурсы */
  });
}

littleDataTable.addEventListener('click', handleClickSmall);
bigDataTable.addEventListener('click', handleClickBig);
