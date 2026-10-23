'use strict';

/**
 * Small interactions for the inner pages.
 * Relies on helpers defined in script.js (inrFormatter, showToast, updateCart,
 * cartTotal, cartCount, wishlistCount) – script.js is loaded first.
 */



/**
 * quantity steppers (cart + product page)
 */

document.querySelectorAll(".qty").forEach(function (qty) {
  const input = qty.querySelector("[data-qty-input]");
  const minus = qty.querySelector("[data-qty-minus]");
  const plus = qty.querySelector("[data-qty-plus]");
  if (!input) return;

  const setQty = function (value) {
    const min = Number(input.min) || 1;
    const max = Number(input.max) || 10;
    input.value = Math.min(max, Math.max(min, value || min));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  if (minus) minus.addEventListener("click", function () { setQty(Number(input.value) - 1); });
  if (plus) plus.addEventListener("click", function () { setQty(Number(input.value) + 1); });
  input.addEventListener("blur", function () { setQty(Number(input.value)); });
});



/**
 * cart page – recalculate totals
 */

const cartList = document.querySelector("[data-cart-list]");

if (cartList) {
  const sumCount = document.querySelector("[data-sum-count]");
  const sumMrp = document.querySelector("[data-sum-mrp]");
  const sumDiscount = document.querySelector("[data-sum-discount]");
  const sumShip = document.querySelector("[data-sum-ship]");
  const sumTotal = document.querySelector("[data-sum-total]");
  const freeShip = document.querySelector("[data-free-ship]");
  const emptyState = document.querySelector("[data-cart-empty]");
  const FREE_SHIPPING_ABOVE = 499;
  const SHIPPING_FEE = 49;

  const recalc = function () {
    const items = cartList.querySelectorAll("[data-cart-item]");
    let total = 0;
    let mrp = 0;
    let count = 0;

    items.forEach(function (item) {
      const unit = Number(item.dataset.unit);
      const del = item.querySelector(".unit-price del");
      const unitMrp = del ? Number(del.textContent.replace(/[^\d.]/g, "")) : unit;
      const qty = Number(item.querySelector("[data-qty-input]").value);

      item.querySelector("[data-line-total]").textContent = inrFormatter.format(unit * qty);
      total += unit * qty;
      mrp += unitMrp * qty;
      count += qty;
    });

    const shipping = total === 0 || total >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;

    sumCount.textContent = count;
    sumMrp.textContent = inrFormatter.format(mrp);
    sumDiscount.textContent = "− " + inrFormatter.format(mrp - total);
    sumShip.textContent = shipping ? inrFormatter.format(shipping) : "FREE";
    sumTotal.textContent = inrFormatter.format(total + shipping);

    freeShip.hidden = total < FREE_SHIPPING_ABOVE;
    emptyState.hidden = items.length > 0;

    cartTotal = total;
    cartCount = count;
    updateCart();
  }

  cartList.addEventListener("change", recalc);

  cartList.addEventListener("click", function (event) {
    const removeBtn = event.target.closest("[data-remove-item]");
    if (!removeBtn) return;
    const item = removeBtn.closest("[data-cart-item]");
    const name = item.querySelector(".title").textContent;
    item.remove();
    recalc();
    showToast(name + " removed from cart");
  });
}



/**
 * checkout – delivery option changes total
 */

const coTotal = document.querySelector("[data-co-total]");

if (coTotal) {
  const coShip = document.querySelector("[data-co-ship]");
  const base = Number(coTotal.dataset.base);

  document.querySelectorAll("[data-delivery]").forEach(function (radio) {
    radio.addEventListener("change", function () {
      const fee = Number(radio.value);
      coShip.textContent = fee ? inrFormatter.format(fee) : "FREE";
      coShip.classList.toggle("green", fee === 0);
      coTotal.textContent = inrFormatter.format(base + fee);
    });
  });
}



/**
 * orders – filter tabs
 */

const orderFilters = document.querySelectorAll("[data-order-filter]");

orderFilters.forEach(function (tab) {
  tab.addEventListener("click", function () {
    const filter = tab.dataset.orderFilter;

    orderFilters.forEach(function (t) { t.classList.toggle("active", t === tab); });

    document.querySelectorAll(".order-card[data-status]").forEach(function (card) {
      card.hidden = filter !== "all" && card.dataset.status !== filter;
    });
  });
});



/**
 * wishlist – remove / move to cart
 */

const wishlistGrid = document.querySelector("[data-wishlist-grid]");

if (wishlistGrid) {
  const emptyWishlist = document.querySelector("[data-wishlist-empty]");

  const removeCard = function (card) {
    card.closest("li").remove();
    wishlistCount = Math.max(0, wishlistCount - 1);
    if (wishlistCountElem) wishlistCountElem.textContent = wishlistCount;
    emptyWishlist.hidden = wishlistGrid.children.length > 0;
  }

  wishlistGrid.addEventListener("click", function (event) {
    const removeBtn = event.target.closest("[data-wishlist-remove]");
    const moveBtn = event.target.closest("[data-move-to-cart]");
    if (!removeBtn && !moveBtn) return;

    const card = event.target.closest(".shop-card");
    const name = card.querySelector(".card-title").textContent.trim();

    if (moveBtn) {
      cartTotal += Number(card.querySelector("[data-price]").dataset.price);
      cartCount++;
      updateCart();
      showToast(name + " moved to cart");
    } else {
      showToast(name + " removed from wishlist");
    }

    removeCard(card);
  });
}



/**
 * product page – gallery, wishlist toggle, pincode check
 */

const mainImg = document.querySelector("[data-main-img]");
const thumbs = document.querySelectorAll("[data-thumb]");

thumbs.forEach(function (thumb) {
  thumb.addEventListener("click", function () {
    mainImg.src = thumb.dataset.thumb;
    thumbs.forEach(function (t) { t.classList.toggle("active", t === thumb); });
  });
});

const wishlistToggle = document.querySelector("[data-wishlist-toggle]");

if (wishlistToggle) {
  wishlistToggle.addEventListener("click", function () {
    const added = wishlistToggle.classList.toggle("is-wishlisted");
    const icon = wishlistToggle.querySelector("ion-icon");
    if (icon) icon.setAttribute("name", added ? "star" : "star-outline");
    wishlistCount += added ? 1 : -1;
    if (wishlistCountElem) wishlistCountElem.textContent = wishlistCount;
    showToast(added ? "Added to wishlist" : "Removed from wishlist");
  });
}

const pinBtn = document.querySelector("[data-pin-check]");

if (pinBtn) {
  pinBtn.addEventListener("click", function () {
    const pin = document.getElementById("pin").value.trim();
    const result = document.querySelector("[data-pin-result] span");

    if (/^[1-9]\d{5}$/.test(pin)) {
      result.innerHTML = "Delivery to " + pin + " by <strong>28 Oct</strong> &middot; Free shipping &middot; COD available";
    } else {
      result.textContent = "Please enter a valid 6-digit PIN code";
    }
  });
}



/**
 * static forms – show a confirmation instead of reloading
 */

document.querySelectorAll("[data-fake-save]").forEach(function (btn) {
  btn.closest("form").addEventListener("submit", function (event) {
    event.preventDefault();
    showToast("Changes saved successfully");
  });
});
