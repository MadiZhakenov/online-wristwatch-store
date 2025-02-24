async function displayOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in to view orders.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch orders");
        }

        const orders = await response.json();

        const ordersContainer = document.getElementById("orders-container");
        ordersContainer.innerHTML = ""; // Clear old content

        if (orders.length === 0) {
            ordersContainer.innerHTML = "<p>No orders found.</p>";
            return;
        }

        // Loop through the orders and display them
        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order-item');
            orderDiv.innerHTML = `
                <h3>Order ID: ${order._id}</h3>
                <p>Status: ${order.status}</p>
                <ul>
                    ${order.products.map(product => 
                        `<li>${product.productId.name} (Price: $${product.productId.price}) x ${product.quantity}</li>`
                    ).join('')}
                </ul>
                <p class="total-price">Total Price: $${order.totalAmount}</p>
            `;
            ordersContainer.appendChild(orderDiv);
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        alert("Error fetching orders. Please try again.");
    }
}

// Helper function to get cart data
async function fetchCartData(token) {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart data');
        }

        const cart = await response.json();
        return cart.products;
    } catch (error) {
        console.error("Error fetching cart:", error);
        return [];
    }
}

// Helper function to clear cart
async function clearCart(token) {
    try {
        const response = await fetch(`${API_URL}/cart/clear`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to clear cart');
        }

        console.log('Cart cleared');
    } catch (error) {
        console.error("Error clearing cart:", error);
    }
}

// Call displayOrders when the page loads
document.addEventListener("DOMContentLoaded", displayOrders);
