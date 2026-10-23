'use strict';



/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}



/**
 * navbar toggle
 */

const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
}

addEventOnElem(navTogglers, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
}

addEventOnElem(navbarLinks, "click", closeNavbar);



/**
 * header sticky & back top btn active
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const headerActive = function () {
  if (window.scrollY > 150) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
}

addEventOnElem(window, "scroll", headerActive);

let lastScrolledPos = 0;

const headerSticky = function () {
  if (lastScrolledPos >= window.scrollY) {
    header.classList.remove("header-hide");
  } else {
    header.classList.add("header-hide");
  }

  lastScrolledPos = window.scrollY;
}

addEventOnElem(window, "scroll", headerSticky);



/**
 * scroll reveal effect
 */

const sections = document.querySelectorAll("[data-section]");

const scrollReveal = function () {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].getBoundingClientRect().top < window.innerHeight / 2) {
      sections[i].classList.add("active");
    }
  }
}

scrollReveal();

addEventOnElem(window, "scroll", scrollReveal);


/**
 * cart & wishlist (prices in Indian Rupees)
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2
});

const cartTotalElem = document.querySelector("[data-cart-total]");
const cartCountElem = document.querySelector("[data-cart-count]");
const wishlistCountElem = document.querySelector("[data-wishlist-count]");
const toastElem = document.querySelector("[data-toast]");

let cartTotal = cartTotalElem ? Number(cartTotalElem.value) || 0 : 0;
let cartCount = cartCountElem ? Number(cartCountElem.textContent) || 0 : 0;
let wishlistCount = wishlistCountElem ? Number(wishlistCountElem.textContent) || 0 : 0;
let toastTimer;

const showToast = function (message) {
  if (!toastElem) return;
  toastElem.textContent = message;
  toastElem.classList.add("active");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastElem.classList.remove("active");
  }, 2200);
}

const getProductInfo = function (btn) {
  const card = btn.closest(".shop-card");
  const priceElem = card.querySelector("[data-price]");
  const titleElem = card.querySelector(".card-title");
  return {
    name: titleElem ? titleElem.textContent.trim() : "Product",
    price: priceElem ? Number(priceElem.dataset.price) : 0
  };
}

const updateCart = function () {
  if (!cartTotalElem || !cartCountElem) return;
  cartTotalElem.textContent = inrFormatter.format(cartTotal);
  cartTotalElem.value = cartTotal;
  cartCountElem.textContent = cartCount;
}

document.querySelectorAll('.shop-card [aria-label="add to cart"]').forEach(function (btn) {
  btn.addEventListener("click", function () {
    const product = getProductInfo(btn);
    cartTotal += product.price;
    cartCount++;
    updateCart();
    showToast(product.name + " added to cart – " + inrFormatter.format(product.price));
  });
});

document.querySelectorAll('.shop-card [aria-label="add to whishlist"]').forEach(function (btn) {
  btn.addEventListener("click", function () {
    const product = getProductInfo(btn);
    const icon = btn.querySelector("ion-icon");
    const isAdded = btn.classList.toggle("is-wishlisted");

    wishlistCount += isAdded ? 1 : -1;
    if (wishlistCountElem) wishlistCountElem.textContent = wishlistCount;
    if (icon) icon.setAttribute("name", isAdded ? "star" : "star-outline");

    showToast(product.name + (isAdded ? " added to wishlist" : " removed from wishlist"));
  });
});
