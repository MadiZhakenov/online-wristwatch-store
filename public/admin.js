let token = localStorage.getItem("token");
async function fetchAdminProducts() {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    document.getElementById('adminProducts').innerHTML = products.map(p =>
        `<div class="product-card">
            <h3>${p.name}</h3>
            <p>Brand: ${p.brand}</p>
            <p>Price: $${p.price}</p>
            <button onclick="deleteProduct('${p._id}')">Delete</button>
        </div>`
    ).join('');
}

async function fetchData() {
    try {
        const token = localStorage.getItem('token');
        console.log('Token', token);
        if (!token) {
            alert('Please log in.');
            return;
        }
        
        const ordersResponse = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const customersResponse = await fetch(`${API_URL}/customers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const cartsResponse = await fetch(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const paymentsResponse = await fetch(`${API_URL}/payments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!ordersResponse.ok || !customersResponse.ok || !cartsResponse.ok || !paymentsResponse.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const orders = await ordersResponse.json();
        const customers = await customersResponse.json();
        const carts = await cartsResponse.json();
        const payments = await paymentsResponse.json();

        displayOrders(orders);
        displayCustomers(customers);
        displayCarts(carts);
        displayPayments(payments);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


// Function to display orders
function displayOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    ordersContainer.innerHTML = ''; // Clear previous data

    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.innerHTML = `
            <h4>Order ID: ${order._id}</h4>
            <p>Status: ${order.status}</p>
            <p>Customer: ${order.customerId}</p>
            <ul>
            ${order.products.map(product => 
                product.productId ? 
                `<li>${product.productId.name} - $${product.productId.price} x ${product.quantity}</li>` : 
                `<li>Product not found</li>`
            ).join('')}
            </ul>

            <p>Total Price: $${order.totalAmount}</p>
            <button onclick="updateOrderStatus('${order._id}')">Update Status</button>
        `;
        ordersContainer.appendChild(orderDiv);
    });
}


// Function to display customers
function displayCustomers(customers) {
    const customersContainer = document.getElementById('customers-container');
    customersContainer.innerHTML = ''; // Clear previous data

    customers.forEach(customer => {
        const customerDiv = document.createElement('div');
        customerDiv.innerHTML = `
            <h4>Customer: ${customer.name}</h4>
            <p>Email: ${customer.email}</p>
            <button onclick="deleteCustomer('${customer._id}')">Delete Customer</button>
        `;
        customersContainer.appendChild(customerDiv);
    });
}

// Function to display carts
function displayCarts(carts) {
    const cartsContainer = document.getElementById('carts-container');
    cartsContainer.innerHTML = ''; // Clear previous data

    // Check if carts is not null or empty
    if (!carts || carts.length === 0) {
        cartsContainer.innerHTML = '<p>No carts available.</p>';
        return; // Exit if no carts are found
    }

    carts.forEach(cart => {
        const cartDiv = document.createElement('div');
        cartDiv.innerHTML = `
            <h4>Cart ID: ${cart._id}</h4>
            <ul>
                ${cart.products.map(product => `<li>${product.productId.name} - $${product.productId.price} x ${product.quantity}</li>`).join('')}
            </ul>
            <p>Total Price: $${cart.totalPrice}</p>
            <button onclick="clearCart('${cart._id}')">Clear Cart</button>
        `;
        cartsContainer.appendChild(cartDiv);
    });
}

// Function to display payments
function displayPayments(payments) {
    const paymentsContainer = document.getElementById('payments-container');
    paymentsContainer.innerHTML = ''; // Clear previous data
    payments.forEach(payment => {
        const paymentDiv = document.createElement('div');
        paymentDiv.innerHTML = `
            <h4>Payment ID: ${payment._id}</h4>
            <p>Amount: $${payment.amount}</p>
            <p>Customer: ${payment.customerId}</p>
            <p>Order ID: ${payment.orderId}</p>
            <p>Payment Date: ${payment.paymentDate}</p>
            <p>Payment Method: ${payment.paymentMethod}</p>
        `;
        paymentsContainer.appendChild(paymentDiv);
    });
}

// Function to update order status
async function updateOrderStatus(orderId) {
    const newStatus = prompt('Enter new status for the order (e.g., Shipped, Delivered):');
    if (!newStatus) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to be logged in to update the order.");
        return;
    }

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('Order status updated successfully!');
            fetchData(); // Refresh the data
        } else {
            alert('Failed to update order status.');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

// Function to delete a customer
async function deleteCustomer(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            alert('Customer deleted successfully!');
            fetchData(); // Refresh the data
        } else {
            alert('Failed to delete customer.');
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
    }
}

async function clearCart(cartId) {
    try {
        const response = await fetch(`/api/cart/${cartId}`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`, // Заголовок с токеном
                "Content-Type": "application/json"
              }
        });

        if (response.ok) {
            alert('Cart cleared successfully!');
            fetchData(); // Refresh the data
        } else {
            alert('Failed to clear cart.');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

document.getElementById("addProductForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newProduct = {
        name: document.getElementById("name").value,
        brand: document.getElementById("brand").value,
        price: document.getElementById("price").value,
        description: document.getElementById("description").value,
        stockQuantity: document.getElementById("stock").value,
        category: document.getElementById("category").value
    };
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newProduct)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Product added!");
            fetchAdminProducts();
        } else {
            throw new Error(result.details ? result.details.join("\n") : result.message);
        }
    }
    catch (error) {
        alert("Error adding product:\n" + error.message); 
    }
});

async function deleteProduct(productId) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (response.ok) {
        alert("Product deleted successfully!");
        fetchAdminProducts(); // Refresh product list
    } else {
        const errorMessage = await response.json();
        alert(`Failed to delete product: ${errorMessage.message}`);
    }
}

// 🔹 Auto Fetch on Page Load
fetchAdminProducts();
// Load data when the admin page is loaded
document.addEventListener('DOMContentLoaded', fetchData);
