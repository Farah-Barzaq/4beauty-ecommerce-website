function setupDarkMode() {
  const themeButton = document.querySelector(".theme-button i");

  if (localStorage.getItem("darkMode") === "enable") {
    document.body.classList.add("dark-mode");
    if (themeButton) themeButton.classList.replace("fa-moon", "fa-sun");
  }

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const isDarkMode = document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", isDarkMode ? "enable" : "disable");
      themeButton.classList.toggle("fa-sun", isDarkMode);
      themeButton.classList.toggle("fa-moon", !isDarkMode);
    });
  }
}

function setupNavigation() {
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const navMenu = document.getElementById("nav-menu");
  const navOverlay = document.getElementById("nav-overlay");

  const openMenu = () => {
    if (navMenu) navMenu.classList.add("active");
    if (navOverlay) navOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    if (navMenu) navMenu.classList.remove("active");
    if (navOverlay) navOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
  };

  if (menuToggle) menuToggle.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (navOverlay) navOverlay.addEventListener("click", closeMenu);

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-center li a");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const linkPage = link.getAttribute("href");

    if (
      linkPage === currentPage ||
      (currentPage === "" && linkPage === "index.html")
    ) {
      link.classList.add("active");
    }
  });
}

async function fetchBeautyProducts() {
  const container = document.getElementById("products-container");
  if (!container) return;

  try {
    const response = await fetch(
      "https://makeup-api.herokuapp.com/api/v1/products.json?product_type=lipstick",
    );
    if (!response.ok) throw new Error("failed to fetch data");

    const products = await response.json();
    const newProducts = products.slice(0, 8);

    container.innerHTML = "";

    newProducts.forEach((product) => {
      const price =
        product.price && parseFloat(product.price) > 0
          ? `$${parseFloat(product.price).toFixed(2)}`
          : "$15.00";
      let imageUrl = product.api_featured_image || "images/placeholder.png";
      if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;

      const brandName = product.brand ? product.brand : "Beauty";
      const safeName = product.name
        ? product.name.replace(/['"]/g, "")
        : "Makeup Product";

      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      productCard.innerHTML = `
        <div>
          <span class="product-brand">${brandName}</span>
          <div class="product-image-container">
            <img src="${imageUrl}" alt="${safeName}" class="product-image" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x200.png?text=Beauty+Product';" />
          </div>
          <h3 class="product-title">${safeName}</h3>
        </div>
        <div>
          <p class="product-price">${price}</p>
          <button class="add-to-cart-btn" data-id="${product.id}" data-name="${safeName}" data-price="${price}" data-image="${imageUrl}">
            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
          </button>
        </div>
      `;

      container.appendChild(productCard);
    });

    attachAddToCartEvents();
  } catch (error) {
    console.error("error:", error);
    container.innerHTML = `<p class="error-text">couldn't upload products</p>`;
  }
}

async function fetchOfferProducts() {
  const container = document.getElementById("offers-container");
  if (!container) return;

  try {
    const response = await fetch(
      "https://makeup-api.herokuapp.com/api/v1/products.json?product_type=blush"
    );
    if (!response.ok) throw new Error("fetch failed");

    const products = await response.json();
    const offerProducts = products.slice(0, 8);

    container.innerHTML = "";

    offerProducts.forEach((product) => {
      const basePrice =
        parseFloat(product.price) > 0 ? parseFloat(product.price) : 15.0;
      const originalPrice = (basePrice * 1.25).toFixed(2);
      const salePrice = `$${basePrice.toFixed(2)}`;

      let imageUrl = product.api_featured_image || "images/placeholder.png";
      if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;

      const brandName = product.brand ? product.brand : "Beauty";
      const safeName = product.name
        ? product.name.replace(/['"]/g, "")
        : "Offer Product";

      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      productCard.innerHTML = `
        <div>
          <span class="product-brand">${brandName}</span>
          <div class="product-image-container">
            <span class="badge-discount">-20%</span>
            <img src="${imageUrl}" alt="${safeName}" class="product-image" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x200.png?text=Offer+Product';" />
          </div>
          <h3 class="product-title">${safeName}</h3>
        </div>
        <div>
          <p class="product-price">${salePrice} <span style="font-size:0.8rem; text-decoration:line-through; color:#888;">$${originalPrice}</span></p>
          <button class="add-to-cart-btn" data-id="${product.id}" data-name="${safeName}" data-price="${salePrice}" data-image="${imageUrl}">
            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
          </button>
        </div>
      `;

      container.appendChild(productCard);
    });

    attachAddToCartEvents();
  } catch (error) {
    console.error("offers fails ", error);
  }
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function attachAddToCartEvents() {
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.onclick = (e) => {
      const btn = e.currentTarget;
      const productData = {
        id: btn.getAttribute("data-id"),
        name: btn.getAttribute("data-name"),
        price: btn.getAttribute("data-price"),
        image: btn.getAttribute("data-image"),
      };
      addToCart(productData);
    };
  });
}

function addToCart(productData) {
  const existingProductIndex = cart.findIndex(
    (item) => String(item.id) === String(productData.id),
  );

  if (existingProductIndex > -1) {
    cart[existingProductIndex].quantity += 1;
  } else {
    cart.push({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      image: productData.image,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  showToast(`Added "${productData.name}" to cart!`);
}

function updateCartBadge() {
  const cartBadge = document.getElementById("cart-count");
  if (cartBadge) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;
  }
}

function showToast(message) {
  const oldToast = document.querySelector(".toast-notification");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.classList.add("toast-notification");
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function renderCartPage() {
  const container = document.getElementById("cart-items-container");
  const subtotalEl = document.getElementById("subtotal-price");
  const totalEl = document.getElementById("total-price");

  if (!container) return;

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding: 2rem;">Your cart is empty!</p>`;
    if (subtotalEl) subtotalEl.textContent = "$0.00";
    if (totalEl) totalEl.textContent = "$0.00";
    return;
  }

  container.innerHTML = "";
  let totalPrice = 0;

  cart.forEach((item, index) => {
    const itemPriceStr = item && item.price ? String(item.price) : "$0.00";
    const rawPrice = parseFloat(itemPriceStr.replace("$", "")) || 0;
    const itemTotal = rawPrice * item.quantity;
    totalPrice += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image || "images/placeholder.png"}" alt="${item.name}" class="cart-item-img" />
        <div>
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-price">${itemPriceStr}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center;">
        <div class="quantity-controls">
          <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <button class="delete-btn" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    container.appendChild(cartItem);
  });

  const formattedTotal = `$${totalPrice.toFixed(2)}`;
  if (subtotalEl) subtotalEl.textContent = formattedTotal;
  if (totalEl) totalEl.textContent = formattedTotal;
}

function updateQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  renderCartPage();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  renderCartPage();
}

let rawFetchedProducts = [];

async function loadProductsPage() {
  const container = document.getElementById("all-products-container");
  const categorySelect = document.getElementById("category-select");
  const brandSelect = document.getElementById("brand-select");
  const sortSelect = document.getElementById("sort-select");
  const searchInput = document.getElementById("search-input");

  if (!container) return;

  async function fetchCategoryData() {
    const selectedCategory = categorySelect ? categorySelect.value : "lipstick";
    container.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:10px;">Loading items...</p></div>`;

    try {
      const response = await fetch(
        `https://makeup-api.herokuapp.com/api/v1/products.json?product_type=${selectedCategory}`,
      );
      if (!response.ok) throw new Error(" failed fetch");

      rawFetchedProducts = await response.json();
      applyFiltersAndRender();
    } catch (error) {
      console.error(error);
      container.innerHTML = `<p class="error-text">could not load products.</p>`;
    }
  }

  function applyFiltersAndRender() {
    let filtered = [...rawFetchedProducts];

    const searchTerm = searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";
    if (searchTerm !== "") {
      filtered = filtered.filter(
        (p) => p.name && p.name.toLowerCase().includes(searchTerm),
      );
    }

    const selectedBrand = brandSelect ? brandSelect.value : "all";
    if (selectedBrand !== "all") {
      filtered = filtered.filter(
        (p) => p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase(),
      );
    }

    const sortOrder = sortSelect ? sortSelect.value : "default";
    if (sortOrder === "low-to-high") {
      filtered.sort(
        (a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0),
      );
    } else if (sortOrder === "high-to-low") {
      filtered.sort(
        (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0),
      );
    }

    renderFilteredGrid(filtered);
  }

  function renderFilteredGrid(products) {
    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">No products found matching your search.</p>`;
      return;
    }

    products.forEach((product) => {
      const price =
        product.price && parseFloat(product.price) > 0
          ? `$${parseFloat(product.price).toFixed(2)}`
          : "$15.00";
      let imageUrl = product.api_featured_image || "images/placeholder.png";
      if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;

      const brandName = product.brand ? product.brand : "Beauty";
      const safeName = (product.name || "Makeup Item").replace(/['"]/g, "");

      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      productCard.innerHTML = `
        <div>
          <span class="product-brand">${brandName}</span>
          <div class="product-image-container">
            <img src="${imageUrl}" alt="${safeName}" class="product-image" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x200.png?text=Beauty+Product';" />
          </div>
          <h3 class="product-title">${safeName}</h3>
        </div>
        <div>
          <p class="product-price">${price}</p>
          <button class="add-to-cart-btn" data-id="${product.id}" data-name="${safeName}" data-price="${price}" data-image="${imageUrl}">
            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
          </button>
        </div>
      `;

      container.appendChild(productCard);
    });

    if (typeof attachAddToCartEvents === "function") {
      attachAddToCartEvents();
    }
  }

  if (categorySelect)
    categorySelect.addEventListener("change", fetchCategoryData);
  if (brandSelect)
    brandSelect.addEventListener("change", applyFiltersAndRender);
  if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);
  if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);

  fetchCategoryData();
}
document.addEventListener("DOMContentLoaded", () => {
  setupDarkMode();
  setupNavigation();
  updateCartBadge();
  setupContactForm();

  if (document.getElementById("products-container")) {
    fetchBeautyProducts();
  }

  if (document.getElementById("offers-container")) {
    fetchOfferProducts();
  }

  if (document.getElementById("cart-items-container")) {
    renderCartPage();
  }

  if (document.getElementById("all-products-container")) {
    loadProductsPage();
  }
});

function setupContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("user-name").value;

    if (typeof showToast === "function") {
      showToast(`Thank you ${nameInput}! Message sent successfully.`);
    } else {
      alert("Message sent successfully!");
    }

    contactForm.reset();
  });
}
