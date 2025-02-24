document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.getElementById("nav-links");
    if (!navLinks) return;

    const token = localStorage.getItem("token");

    if (token) {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const userRole = tokenPayload.role;

        // Update navbar links based on user role
        navLinks.innerHTML = userRole === "admin"
        ? `<a href="index.html">Home</a>
        <a href="cart.html">Cart</a>  
        <a href="order.html">Orders</a>   <!-- Added Orders Link -->
        <a href="admin.html">Admin Panel</a>
        <a href="logout.html">Logout</a>`
        : `<a href="index.html">Home</a> 
        <a href="cart.html">Cart</a>  
        <a href="order.html">Orders</a>   <!-- Added Orders Link -->
        <a href="profile.html">Profile</a>
        <a href="logout.html">Logout</a>`;
    } else {
        navLinks.innerHTML = `<a href="index.html">Home</a> 
                              <a href="login.html">Login</a>`;
    }
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    
    const cartKey = Object.keys(localStorage).find(key => key.startsWith("cart_"));
    if (cartKey) localStorage.removeItem(cartKey);
    
    window.location.href = "login.html";
});


document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById("registerStatus").innerText = "Registration Successful!";
        setTimeout(() => window.location.href = "login.html", 1000);
    } else {
        document.getElementById("registerStatus").innerText = data.message || "Registration Failed!";
    }
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem("token", data.token);

        // Decode JWT to check role
        const tokenPayload = JSON.parse(atob(data.token.split(".")[1]));
        const userRole = tokenPayload.role;

        // Redirect based on role
        if (userRole === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }
    } else {
        document.getElementById("loginStatus").innerText = "Invalid credentials!";
    }
});