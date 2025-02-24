async function fetchProductForPayment() {
    const token = localStorage.getItem("token");
    const productId = localStorage.getItem("productForOrder");

    if (!token || !productId) {
        alert("You need to log in and select a product first!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch cart details");
        }

        const cart = await response.json();
        const product = cart.products.find(item => item.productId._id === productId);

        if (!product) {
            alert("Product not found in cart.");
            return;
        }

        const productPrice = product.productId.price;
        const quantity = product.quantity;
        const totalPrice = productPrice * quantity;

        // Display product details and total price
        displayProductDetails(product.productId, totalPrice, quantity);

    } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to fetch product details.");
    }
}

function displayProductDetails(product, totalPrice, quantity) {
    const productContainer = document.getElementById("product-details-container");

    // Clear any existing content
    productContainer.innerHTML = "";

    // Display the product details and total price
    productContainer.innerHTML = `
        <h3>${product.name}</h3>
        <p>Price per unit: $${product.price}</p>
        <p>Quantity: ${quantity}</p>
        <p>Total Price: $${totalPrice}</p>
    `;
}


async function processPayment(event) {
    event.preventDefault();  // Prevent form submission

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in first!");
        return;
    }
    const productId = localStorage.getItem("productForOrder");

    const cardNumber = document.getElementById("credit-card").value;
    const cvv = document.getElementById("cvv").value;

    // Check if credit card and CVV are provided
    if (!cardNumber || !cvv) {
        alert("Please enter valid payment details.");
        return;
    }

    const paymentDetails = {
        cardNumber,
        cvv
    };


    try {
        // Fetch cart data before proceeding with payment
        const cartResponse = await fetch(`${API_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!cartResponse.ok) {
            throw new Error("Failed to fetch cart data");
        }

        const cart = await cartResponse.json();
        const products = cart.products.find(item => item.productId._id === productId);

        // Check if the cart has items
        if (!products || products.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        // Send payment request with the cart items
        const paymentData = {
            cardNumber,
            cvv,
            products: [{
                productId: products.productId._id,
                quantity: products.quantity
            }]
        };

        const response = await fetch(`${API_URL}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            throw new Error('Payment failed');
        }

        const data = await response.json();
        alert("Payment successful!");

        // After payment success, create an order with the cart items
        await createOrder([paymentData.products[0]]); 

    } catch (error) {
        console.error("Payment error:", error);
        alert("Payment failed. Please try again.");
    }
}

async function createOrder(products) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                products: products,  // Ensure products is an array
                totalAmount: calculateTotalAmount(products),  // Calculate total based on products and quantities
                status: "Placed"  // Set the status to "Placed"
            })
        });

        if (!response.ok) {
            throw new Error('Order creation failed');
        }

        const order = await response.json();
        console.log('Order placed:', order);


        console.log('Redirecting to orders page...');
        // Redirect to orders page
        window.location.href = "order.html";

    } catch (error) {
        console.error("Error placing order:", error);
        alert("Failed to create order.");
    }
}

function calculateTotalAmount(products) {
    let total = 0;
    products.forEach(product => {
        total += product.productId.price * product.quantity;
    });
    return total;
}

// Listen for form submission
const paymentForm = document.getElementById("payment-form");
if (paymentForm) {
    paymentForm.addEventListener("submit", processPayment);
}

// Fetch product data when the page loads
document.addEventListener("DOMContentLoaded", fetchProductForPayment);
