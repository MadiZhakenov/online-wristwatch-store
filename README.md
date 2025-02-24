# 🕒 Wristwatch Store

Wristwatch Store is a full-stack e-commerce application for selling wristwatches. It allows users to browse products, add them to a cart, place orders, and process payments. Admin users can manage products, orders, and customers.

## 🚀 Features
- User authentication (JWT-based)
- Product management (Admin only)
- Cart & order system
- Payment processing (Mock)
- Profile management
- Role-based access control (RBAC)
- Validation using Joi
- Hosted on **Render**
- MongoDB Atlas as the database

---

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT
- **Validation:** Joi
- **Deployment:** Render

---

## 🔧 Setup Instructions

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/MadiZhakenov/online-wristwatch-store.git
cd online-wristwatch-store


### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory:
```sh
MONGO_URI="mongodb+srv://your_user:your_password@your_cluster.mongodb.net/your_db"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

### 4️⃣ Start the Server
Run the backend:
```sh
node server.js
```

### 5️⃣ Start the Frontend
Simply open `index.html` in a browser.

---

## 🛠️ API Documentation

### **🔹 Authentication**
#### **📌 Register a User**
```http
POST /register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass",
  "role": "customer"
}
```
**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### **📌 Login**
```http
POST /login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass"
}
```
**Response:**
```json
{
  "token": "your_jwt_token"
}
```

---

### **🔹 Products**
#### **📌 Get All Products**
```http
GET /api/products
```
**Response:**
```json
[
  {
    "id": "123",
    "name": "Rolex Watch",
    "price": 999,
    "stock": 10
  }
]
```

#### **📌 Add a Product (Admin Only)**
```http
POST /api/products
Authorization: Bearer token
```
**Body:**
```json
{
  "name": "New Watch",
  "description": "Luxury watch",
  "price": 500,
  "stock": 15
}
```
**Response:**
```json
{
  "message": "Product added successfully"
}
```

#### **📌 Delete a Product (Admin Only)**
```http
DELETE /api/products/{productId}
Authorization: Bearer token
```
**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

### **🔹 Cart**
#### **📌 View Cart**
```http
GET /api/cart
Authorization: Bearer token
```

#### **📌 Add to Cart**
```http
POST /api/cart/add
Authorization: Bearer token
```
**Body:**
```json
{
  "productId": "123",
  "quantity": 1
}
```
**Response:**
```json
{
  "message": "Product added to cart"
}
```

#### **📌 Clear Cart**
```http
DELETE /api/cart/clear
Authorization: Bearer token
```

---

### **🔹 Orders**
#### **📌 Place an Order**
```http
POST /api/orders
Authorization: Bearer token
```
**Body:**
```json
{
  "products": [
    { "productId": "123", "quantity": 2 }
  ]
}
```
**Response:**
```json
{
  "message": "Order placed successfully"
}
```

#### **📌 Get User Orders**
```http
GET /api/orders
Authorization: Bearer token
```

---

### **🔹 Profile**
#### **📌 Get Profile**
```http
GET /api/users/profile
Authorization: Bearer token
```

#### **📌 Update Profile**
```http
PUT /api/users/profile
Authorization: Bearer token
```
**Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```
**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

---

## 🚀 Deployment on Render
### 1️⃣ Push Code to GitHub
```sh
git add .
git commit -m "Deploying to Render"
git push origin main
```

### 2️⃣ Deploy to Render
1. Go to [Render](https://render.com).
2. Click **"New Web Service"**.
3. Select your GitHub repository.
4. Set **Start Command**:
   ```sh
   node server.js
   ```
5. Click **Deploy**.

---

## 🔥 Live Demo
**Frontend:** [Wristwatch Store](https://wristwatch-store.onrender.com)  
**Backend API:** [Wristwatch Store API](https://wristwatch-store.onrender.com/api/products)

---

## 📜 License
This project is licensed under the **MIT License**.