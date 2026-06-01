document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Cart Logic
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountElement = document.querySelector('.cart-count');
    const totalPriceElement = document.getElementById('total-price');
    const addBtns = document.querySelectorAll('.quick-add');
    
    let cart = [];

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                count += item.quantity;

                const itemHTML = `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>Qty: ${item.quantity}</p>
                        </div>
                        <button class="remove-item" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        cartCountElement.innerText = count;
        totalPriceElement.innerText = `Quote on Request`;

        // Attach remove events
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                cart.splice(index, 1);
                updateCartUI();
            });
        });
    }

    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.product-card');
            const id = card.getAttribute('data-id');
            const name = card.getAttribute('data-name');
            const price = parseFloat(card.getAttribute('data-price'));
            const image = card.querySelector('img').src;

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, image, quantity: 1 });
            }

            updateCartUI();
            
            // Open cart
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        });
    });

    const openCart = () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    };

    const hideCart = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });
    closeCart.addEventListener('click', hideCart);
    cartOverlay.addEventListener('click', hideCart);

    // Form submit
    const form = document.getElementById('contact-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            setTimeout(() => {
                btn.innerText = 'Message Sent!';
                btn.style.background = '#28a745';
                btn.style.color = '#fff';
                form.reset();
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 3000);
            }, 1000);
        });
    }
});
