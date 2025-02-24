const mongoose = require('mongoose');

// 🔹 User (Customer/Admin)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" } 
});

// 🔹 Product
const ProductSchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: Number,
  description: String,
  stockQuantity: Number,
  category: String
});

// 🔹 Cart (Each user has a cart)
const CartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
      {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: { type: Number, default: 1 }
      }
  ],
  totalPrice: { type: Number, default: 0 }
});

// 🔹 Order (References user & products)
const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,      
    price: Number,    
    quantity: Number
  }],
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now },
  status: { type: String }
});

// 🔹 Payment (Tracks transactions)
const PaymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentDate: { type: Date, default: Date.now },
  amount: Number,
  paymentMethod: String,
  status: { type: String }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Cart = mongoose.model('Cart', CartSchema);
const Order = mongoose.model('Order', OrderSchema);
const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = { User, Product, Cart, Order, Payment };
