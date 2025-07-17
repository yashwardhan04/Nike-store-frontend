// Import products data (assuming data.js is in the same directory or accessible)
// If you don't use a bundler (like Webpack), you'll need to make sure data.js is loaded
// before app.js in your HTML: <script src="./data.js"></script>
// For simplicity, I'm assuming 'products' array is globally available after data.js is loaded.
// If not, you'd wrap this in an IIFE or use ES Modules with a build step.

// For demonstration, let's assume 'products' is already defined globally by data.js
// If you want true modularity, you'd use: import { products } from './data.js';
// And set type="module" in your script tag: <script type="module" src="./app.js"></script>
// But for direct browser execution without a bundler, the global variable approach from data.js
// loaded first is simplest.

const wrapper = document.querySelector(".sliderWrapper");
const menuItems = document.querySelectorAll(".menuItem");

// DOM Elements for Product Details Section
const currentProductImg = document.querySelector(".productImg");
const currentProductTitle = document.querySelector(".productTitle");
const currentProductPrice = document.querySelector(".productPrice");
const currentProductColorsContainer = document.querySelector(".colors");
const currentProductSizesContainer = document.querySelector(".sizes");
const productButton = document.querySelector(".productButton");

// DOM Elements for Payment Modal
const paymentModal = document.querySelector(".payment");
const paymentCloseBtn = document.querySelector(".close");
const payInputs = paymentModal.querySelectorAll(".payInput");
const payButton = paymentModal.querySelector(".payButton");

// DOM Elements for Cart
const cartIconContainer = document.querySelector(".cartIconContainer");
const cartItemCountSpan = document.querySelector(".cartItemCount");
const cartOverlay = document.querySelector(".cart-overlay");
const cartModal = document.querySelector(".cart-modal");
const cartCloseBtn = document.querySelector(".cart-close");
const cartItemsContainer = document.querySelector(".cart-items");
const cartTotalSpan = document.querySelector(".cart-total");
const emptyCartMessage = document.querySelector(".empty-cart-message");

let choosenProduct = products[0]; // Initial product
let selectedColor = choosenProduct.colors[0].code;
let selectedSize = choosenProduct.sizes[0];

let cart = JSON.parse(localStorage.getItem('shoppingCart')) || []; // Load cart from localStorage

// --- Utility Functions ---

/**
 * Renders the initial slider items dynamically.
 */
function renderSliderItems(filteredProducts = products) {
  wrapper.innerHTML = ''; // Clear existing
  filteredProducts.forEach((product, index) => {
    const sliderItem = document.createElement("div");
    sliderItem.classList.add("sliderItem");
    sliderItem.innerHTML = `
      <img src="${product.colors[0].img}" alt="${product.title}" class="sliderImg">
      <div class="sliderBg"></div>
      <h1 class="sliderTitle">${product.title}</br> NEW</br> SEASON</h1>
      <h2 class="sliderPrice">$${product.price}</h2>
      <a href="#product">
          <button class="buyButton">BUY NOW!</button>
      </a>
    `;
    wrapper.appendChild(sliderItem);

    // Background color and price color based on index
    const sliderBg = sliderItem.querySelector(".sliderBg");
    const sliderPrice = sliderItem.querySelector(".sliderPrice");
    const colors = ["#369e62", "rebeccapurple", "teal", "cornflowerblue", "rgb(124, 115, 80)"];
    const priceColors = ["#369e62", "white", "teal", "cornflowerblue", "cornsilk"];
    if (colors[index]) sliderBg.style.backgroundColor = colors[index];
    if (priceColors[index]) sliderPrice.style.color = priceColors[index];
  });

  wrapper.style.width = `${filteredProducts.length * 100}vw`;
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}


// Search functionality
const searchInput = document.querySelector(".searchInput");

const handleSearch = () => {
  const query = searchInput.value.toLowerCase();
  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  renderSliderItems(filtered);

  if (filtered.length > 0) {
    choosenProduct = filtered[0];
    updateProductDetails();
  } else {
    currentProductTitle.textContent = "No products found";
    currentProductPrice.textContent = "";
    currentProductImg.src = "";
    currentProductColorsContainer.innerHTML = "";
    currentProductSizesContainer.innerHTML = "";
  }
};

searchInput.addEventListener("input", debounce(handleSearch, 300)); // 300ms delay



/**
 * Updates the product details section based on the chosen product.
 */
function updateProductDetails() {
  currentProductTitle.textContent = choosenProduct.title;
  currentProductPrice.textContent = "$" + choosenProduct.price;
  currentProductImg.src = choosenProduct.colors[0].img;
  selectedColor = choosenProduct.colors[0].code; // Reset selected color
  selectedSize = choosenProduct.sizes[0]; // Reset selected size
  
  // Update description (if added to product data)
  const productDesc = document.querySelector(".productDesc");
  if (productDesc && choosenProduct.description) {
    productDesc.textContent = choosenProduct.description;
  }

  // Update colors
  currentProductColorsContainer.innerHTML = "";
  choosenProduct.colors.forEach((color, index) => {
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color");
    colorDiv.style.backgroundColor = color.code;
    if (index === 0) {
      colorDiv.classList.add("selected"); // Default to first color selected
    }
    colorDiv.addEventListener("click", () => {
      currentProductImg.src = color.img;
      // Remove 'selected' from all colors
      currentProductColorsContainer.querySelectorAll(".color").forEach(c => c.classList.remove("selected"));
      // Add 'selected' to clicked color
      colorDiv.classList.add("selected");
      selectedColor = color.code; // Update selected color
    });
    currentProductColorsContainer.appendChild(colorDiv);
  });

  // Update sizes
  currentProductSizesContainer.innerHTML = "";
  choosenProduct.sizes.forEach((size, index) => {
    const sizeDiv = document.createElement("div");
    sizeDiv.classList.add("size");
    sizeDiv.textContent = size;
    if (index === 0) {
      sizeDiv.classList.add("selected"); // Default to first size selected
    }
    sizeDiv.addEventListener("click", () => {
      // Remove 'selected' from all sizes
      currentProductSizesContainer.querySelectorAll(".size").forEach(s => {
        s.classList.remove("selected");
        s.style.backgroundColor = "white"; // Reset background
        s.style.color = "black"; // Reset color
      });
      // Add 'selected' to clicked size
      sizeDiv.classList.add("selected");
      sizeDiv.style.backgroundColor = "black";
      sizeDiv.style.color = "white";
      selectedSize = size; // Update selected size
    });
    currentProductSizesContainer.appendChild(sizeDiv);
  });
}

/**
 * Displays or hides the payment modal.
 * @param {boolean} show - true to show, false to hide.
 */
function togglePaymentModal(show) {
  paymentModal.style.display = show ? "flex" : "none";
}

/**
 * Validates the payment form inputs.
 * @returns {boolean} - true if all inputs are valid, false otherwise.
 */
function validatePaymentForm() {
  let isValid = true;
  payInputs.forEach(input => {
    if (!input.checkValidity()) {
      input.reportValidity(); // Show native browser validation message
      isValid = false;
    }
  });
  // Additional custom validation if needed, e.g., for card numbers with Luhn algorithm
  return isValid;
}

/**
 * Renders the items in the shopping cart.
 */
function renderCart() {
  cartItemsContainer.innerHTML = '';
  let total = 0;

  // Inside renderCart function:
if (cart.length === 0) {
    emptyCartMessage.style.display = 'block';
    cartTotalSpan.textContent = '0';
    document.querySelector(".cart-checkout-button").disabled = true; // Disable checkout button
} else {
    emptyCartMessage.style.display = 'none';
    document.querySelector(".cart-checkout-button").disabled = false; // Enable checkout button
}
// ... rest of renderCart logic ...

  cart.forEach(item => {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.classList.add('cart-item');
    cartItemDiv.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div class="cart-item-details">
          <h4>${item.title}</h4>
          <p>Color: ${item.color}</p>
          <p>Size: ${item.size}</p>
      </div>
      <div class="cart-item-controls">
          <button class="decrease-qty" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">-</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="increase-qty" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">+</button>
          <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
          <button class="cart-item-remove" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">X</button>
      </div>
    `;
    cartItemsContainer.appendChild(cartItemDiv);
    total += item.price * item.quantity;
  });

  cartTotalSpan.textContent = total.toFixed(2);
  updateCartItemCount();
  localStorage.setItem('shoppingCart', JSON.stringify(cart)); // Save to localStorage
}

/**
 * Updates the total item count in the cart icon.
 */
function updateCartItemCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartItemCountSpan.textContent = totalItems;
}

/**
 * Adds a product to the shopping cart.
 * @param {object} productToAdd - The product object to add.
 * @param {string} color - The selected color.
 * @param {string} size - The selected size.
 */
function addToCart(productToAdd, color, size) {
  const existingItem = cart.find(item =>
    item.id === productToAdd.id && item.color === color && item.size === size
  );

  if (existingItem) {
    existingItem.quantity++;
  } else {
    const chosenColorImg = productToAdd.colors.find(c => c.code === color)?.img || productToAdd.colors[0].img;
    cart.push({
      id: productToAdd.id,
      title: productToAdd.title,
      price: productToAdd.price,
      color: color,
      size: size,
      img: chosenColorImg,
      quantity: 1,
    });
  }
  renderCart();
  alert(`${productToAdd.title} (${color}, ${size}) added to cart!`); // Simple feedback
}

/**
 * Handles quantity change in the cart.
 * @param {number} productId - ID of the product.
 * @param {string} color - Color of the product.
 * @param {string} size - Size of the product.
 * @param {number} change - +1 for increase, -1 for decrease.
 */
function changeCartItemQuantity(productId, color, size, change) {
  const itemIndex = cart.findIndex(item =>
    item.id === productId && item.color === color && item.size === size
  );

  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
    }
  }
  renderCart();
}

/**
 * Removes an item from the shopping cart.
 * @param {number} productId - ID of the product to remove.
 * @param {string} color - Color of the product to remove.
 * @param {string} size - Size of the product to remove.
 */
function removeCartItem(productId, color, size) {
  cart = cart.filter(item => !(item.id === productId && item.color === color && item.size === size));
  renderCart();
}

// --- Event Listeners ---

// Initialize slider and product details
document.addEventListener("DOMContentLoaded", () => {
  renderSliderItems();
  updateProductDetails(); // Call once on load for the first product
  renderCart(); // Load and render cart on page load
});

// Slider navigation
menuItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    wrapper.style.transform = `translateX(${-100 * index}vw)`;
    choosenProduct = products[index];
    updateProductDetails(); // Update product section when slider changes
  });
});

// "BUY NOW!" button in Product section
productButton.addEventListener("click", () => {
  // Check if a size is selected, if not, alert user
  if (!selectedSize) {
    alert("Please select a size before adding to cart!");
    return;
  }
  addToCart(choosenProduct, selectedColor, selectedSize);
});

// Open payment modal
// Note: Changed productButton to "Add to Cart" and created a separate checkout button in cart modal.
// The payment modal should open from a "Proceed to Checkout" button in the cart.
document.querySelector(".cart-checkout-button").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before checking out.");
    return;
  }
  cartOverlay.style.display = 'none'; // Close cart modal
  togglePaymentModal(true); // Open payment modal
});

// Close payment modal
paymentCloseBtn.addEventListener("click", () => {
  togglePaymentModal(false);
});

// Payment form submission (basic validation)
payButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default form submission
  if (validatePaymentForm()) {
    alert("Payment Successful! Thank you for your purchase.");
    cart = []; // Clear cart after successful payment
    renderCart();
    togglePaymentModal(false);
  } else {
    alert("Please fill in all required fields correctly.");
  }
});

// Open/Close Cart Modal
cartIconContainer.addEventListener("click", () => {
  cartOverlay.style.display = 'flex';
  renderCart(); // Re-render cart every time it's opened to show latest state
});

cartCloseBtn.addEventListener("click", () => {
  cartOverlay.style.display = 'none';
});

// Event delegation for cart item controls (increase/decrease/remove)
cartItemsContainer.addEventListener('click', (e) => {
  const target = e.target;
  const productId = parseInt(target.dataset.id);
  const color = target.dataset.color;
  const size = target.dataset.size;

  if (target.classList.contains('increase-qty')) {
    changeCartItemQuantity(productId, color, size, 1);
  } else if (target.classList.contains('decrease-qty')) {
    changeCartItemQuantity(productId, color, size, -1);
  } else if (target.classList.contains('cart-item-remove')) {
    removeCartItem(productId, color, size);
  }
});