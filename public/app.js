// Fetch Products from API
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Failed to fetch products");

        const products = await response.json();
        const productsContainer = document.getElementById("products");

        // Populate the products in the HTML
        productsContainer.innerHTML = products.map(p => 
            `<div class="product-card" id="product-${p._id}">
                <h3>${p.name}</h3>
                <p>Brand: ${p.brand}</p>
                <p>Price: $${p.price}</p>
                <button class="add-to-cart-btn" onclick="addToCart('${p._id}')">🛒</button>
            </div>`).join('');

        // Apply styles dynamically to the product cards and buttons
        products.forEach(p => {
            const productCard = document.getElementById(`product-${p._id}`);
            const addToCartButton = productCard.querySelector('.add-to-cart-btn');
            
            // Styling for buttons
            addToCartButton.style.backgroundColor = '#3498db';
            addToCartButton.style.color = 'white';
            addToCartButton.style.border = 'none';
            addToCartButton.style.padding = '10px 15px';
            addToCartButton.style.borderRadius = '5px';
            addToCartButton.style.cursor = 'pointer';
            addToCartButton.style.transition = 'background-color 0.3s ease';

            // Hover effect for button
            addToCartButton.addEventListener('mouseover', () => {
                addToCartButton.style.backgroundColor = '#2980b9';
            });
            addToCartButton.addEventListener('mouseout', () => {
                addToCartButton.style.backgroundColor = '#3498db';
            });
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Check the login status and then fetch the products
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});