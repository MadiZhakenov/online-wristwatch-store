// Function to display the cart items
async function displayCart() {
    const cartContainer = document.getElementById("cart-container");

    // Check if the cart container exists
    if (!cartContainer) {
        console.error("Cart container not found!");
        return; // Exit if the container is not available
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to view cart.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const cart = await response.json();

        cartContainer.innerHTML = ""; // Clear old content

        if (!cart.products || cart.products.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty.</p>";
            return;
        }

        cart.products.forEach(item => {
            const productElement = document.createElement("div");
            
            productElement.style.backgroundColor = '#fff';
            productElement.style.padding = '20px'; 
            productElement.style.borderRadius = '10px';
            productElement.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            productElement.style.display = 'flex';
            productElement.style.flexDirection = 'column';
            productElement.style.gap = '10px';
            productElement.style.marginBottom = '20px';
        
            const titleElement = document.createElement("h3");
            titleElement.textContent = item.productId.name;
            titleElement.style.color = '#007BFF';
            titleElement.style.margin = '0'; 

            const priceElement = document.createElement("p");
            priceElement.textContent = `Price: $${item.productId.price}`;
            priceElement.style.margin = '5px 0'; 

            const quantityElement = document.createElement("p");
            quantityElement.textContent = `Quantity: ${item.quantity}`;
            quantityElement.style.margin = '5px 0';
        
            const orderButton = document.createElement("button");
            orderButton.textContent = "Order";
            orderButton.onclick = () => orderItem(item.productId._id);
            orderButton.style.backgroundColor = '#3498db'; 
            orderButton.style.color = 'white';
            orderButton.style.border = 'none'; 
            orderButton.style.padding = '10px'; 
            orderButton.style.borderRadius = '5px'; 
            orderButton.style.cursor = 'pointer'; 
            orderButton.style.transition = 'background-color 0.3s ease'; 
        
            orderButton.addEventListener('mouseover', () => {
                orderButton.style.backgroundColor = '#2980b9'; 
            });
            orderButton.addEventListener('mouseout', () => {
                orderButton.style.backgroundColor = '#3498db';
            });
        
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.onclick = () => removeFromCart(item.productId._id);
            removeButton.style.backgroundColor = '#e74c3c';
            removeButton.style.color = 'white';
            removeButton.style.border = 'none';
            removeButton.style.padding = '10px';
            removeButton.style.borderRadius = '5px';
            removeButton.style.cursor = 'pointer'; 
            removeButton.style.transition = 'background-color 0.3s ease';
        
            removeButton.addEventListener('mouseover', () => {
                removeButton.style.backgroundColor = '#c0392b';
            });
            removeButton.addEventListener('mouseout', () => {
                removeButton.style.backgroundColor = '#e74c3c';
            });
        
            productElement.appendChild(titleElement);
            productElement.appendChild(priceElement);
            productElement.appendChild(quantityElement);
            productElement.appendChild(orderButton);
            productElement.appendChild(removeButton);
        
            cartContainer.appendChild(productElement);
        });

    } catch (error) {
        console.error("Error fetching cart:", error);
    }
}

async function addToCart(productId) {
    const token = localStorage.getItem("token");
    
    if (!token) {
        alert("You need to log in first!");
        return;
    }

    console.log("Adding to cart. Token:", token);  // Add a log to verify token
    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Ensure the token is being sent
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (!response.ok) throw new Error("Failed to add product to cart");

        alert("Product added to cart!");
        displayCart(); // Update the cart view after adding
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to add product to cart.");
    }
}

// Function to handle removing product from cart
async function removeFromCart(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to remove items.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Failed to remove item");

        alert("Item removed from cart!");
        displayCart(); // Refresh the cart view
    } catch (error) {
        console.error("Error removing from cart:", error);
        alert("Failed to remove product.");
    }
}

async function clearCart() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in first!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart/clear`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to clear cart");
        }

        alert("Cart cleared successfully!");
        displayCart(); // Refresh the cart view after clearing
    } catch (error) {
        console.error("Error clearing cart:", error);
        alert("Failed to clear cart.");
    }
}


// Function to handle ordering the product (goes to payment page)
async function orderItem(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in first!");
        return;
    }

    // Store productId in localStorage to use it in the payment page
    localStorage.setItem("productForOrder", productId);

    // Ensure the product is stored
    console.log("Product ID stored:", productId);

    // Redirect to the payment page to proceed
    window.location.href = "payment.html";
}

// Check if the API_URL is defined
if (typeof API_URL === "undefined") {
    console.error("API_URL is not defined. Ensure that the config.js is included.");
}

// Load the cart when the page is loaded
document.addEventListener("DOMContentLoaded", displayCart);
