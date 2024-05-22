toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: 'toast-bottom-right',
  preventDuplicates: false,
  onclick: null,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '5000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut',
};

let bookList = [];
let basketList = [];

const toggleModal = () => {
  const basketModalEl = document.querySelector('.basket-modal');
  basketModalEl.classList.toggle('active');
};

const getBooks = () => {
  fetch('./products.json')
    .then((res) => res.json())
    .then((books) => (bookList = books));
};
getBooks();

createBookStars = (starRate) => {
  let starRateHtml = '';
  for (let i = 1; i < 6; i++) {
    if (Math.round(starRate) >= i) {
      starRateHtml += `<i class="bi bi-star-fill active"></i>`;
    } else {
      starRateHtml += `<i class="bi bi-star-fill"></i>`;
    }
  }
  return starRateHtml;
};

const createBookItemsHtml = () => {
  const bookListEl = document.querySelector('.book-list');
  let bookListHtml = '';
  bookList.forEach((book, index) => {
    bookListHtml += `
        <div class="col-5 ${index % 2 == 0 && 'offset-2'} my-5">
        <div class="row book-card">
          <div class="col-6">
            <img
              class="img-fluid shadow"
              width="258"
              height="400"
              src="${book.imgSource}"
              alt=""
            />
          </div>
          <div class="col-6 d-flex justify-content-between flex-column">
            <div class="book-detail">
              <span class="fos black fs-4 fw-bold">${book.name}</span> <br />
              <span class="fos gray fs-5">${book.author}</span> <br />
              <span class="book-stars"> 
                ${createBookStars(book.starRate)}
                <span class="gray">${book.reviewCount} Reviews</span>
              </span>
            </div>
            <p class="book-desription mt-3 fos gray">
                ${book.description}
            </p>
            <div>
              <span class="black fw-bold fs-5 me-2">${book.price} ₺</span>
              ${
                book.oldPrice
                  ? ` <span class="gray old-price fs-5 fw-bold"> ${book.oldPrice} ₺ </span>`
                  : ''
              }
            </div>
            <button class="text-uppercase btn-purple" onclick="addBookToBasket(${
              book.id
            })">Add Basket</button>
          </div>
        </div>
      </div>`;
  });

  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: 'Tümü',
  NOVEL: 'Roman',
  CHILDREN: 'Çocuk',
  SELFIMPROVEMENT: 'Kişisel Gelişim',
  FINANCE: 'Finans',
  HISTORY: 'Tarih',
  SCIENCE: 'Bilim',
};

const createBookTypesHtml = () => {
  const filterEl = document.querySelector('.filter');
  let filterHtml = '';
  let filterTypes = ['ALL'];

  bookList.forEach((book) => {
    if (filterTypes.findIndex((filter) => filter == book.type) == -1) {
      filterTypes.push(book.type);
    }
  });

  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${
      index == 0 ? 'active' : null
    }" onclick = "filterBooks(this)" data-type = "${type}">${
      BOOK_TYPES[type] || type
    }</li>`;
  });

  filterEl.innerHTML = filterHtml;
};

const filterBooks = (filterEl) => {
  document.querySelector('.filter .active').classList.remove('active');
  filterEl.classList.add('active');
  let bookType = filterEl.dataset.type;
  getBooks();
  if (bookType != 'ALL')
    bookList = bookList.filter((book) => book.type == bookType);
  createBookItemsHtml();
};

const listBasketItems = () => {
  const basketListEl = document.querySelector('.basket-list');
  const basketCountEl = document.querySelector('.basket-count');
  const totalPriceEl = document.querySelector('.total-price');
  basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;

  let basketListHtml = '';
  let totalPrice = 0;

  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `
    
    <li class="basket-item my-4">
    <img src="${item.product.imgSource}" width="100" height="100" alt="">
    <div class="basket-item-info">
      <h3 class="book-name">${item.product.name}</h3>
      <span class="book-price">${item.product.price} ₺</span> <br>
      <span class="book-remove" onclick="removeItemToBasket(${item.product.id})">remove</span>
    </div>
    <div class="book-count">
      <span class="decrease" onclick="decreaseItemToBasket(${item.product.id})">-</span>
      <span class="mx-1">${item.quantity}</span>
      <span class="increase" onclick="increaseItemToBasket(${item.product.id})">+</span>
    </div>
  </li>
    
    `;
  });

  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : `<li class="basket-item my-4">
  There is no item, return to store to purchase
</li>`;
  totalPriceEl.innerHTML =
    totalPrice > 0 ? 'Total Price : ' + totalPrice.toFixed(2) + '₺' : null;
};

const addBookToBasket = (bookId) => {
  let findedBook = bookList.find((book) => book.id === bookId);
  if (findedBook) {
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId
    );
    if (basketAlreadyIndex == -1) {
      let addedItem = { quantity: 1, product: findedBook };
      basketList.push(addedItem);
      listBasketItems();
    } else {
      if (
        basketList[basketAlreadyIndex].quantity <
        basketList[basketAlreadyIndex].product.stock
      ) {
        basketList[basketAlreadyIndex].quantity += 1;
        listBasketItems();
      } else {
        toastr.error("Sorry, we don't have enough stock.");
        return;
      }
    }
  }
  listBasketItems();
  toastr.success('Book added to basket successfully.');
};

const removeItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }
  listBasketItems();
};

const decreaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 1)
      basketList[findedIndex].quantity -= 1;
    else removeItemToBasket(bookId);
    listBasketItems();
  }
};

const increaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (
      basketList[findedIndex].quantity < basketList[findedIndex].product.stock
    )
      basketList[findedIndex].quantity += 1;
    else toastr.error("Sorry, we don't have enough stock.");
    listBasketItems();
  }
};
setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 100);
