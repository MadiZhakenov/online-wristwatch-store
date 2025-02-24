const express = require("express");
const { User, Product, Order, Cart, Payment } = require("../models/models");
const { userValidationSchema, productValidationSchema, profileValidationSchema } = require('../middleware/validation');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authMiddleware, adminMiddleware } = require("../middleware/middleware");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password} = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
      name,
      email,
      password: hashedPassword
  });

  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// ✅ GET User Profile
router.get("/users/profile", authMiddleware, async (req, res) => {
  try {
      const user = await User.findById(req.user.userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json(user);
  } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// PUT: Update User Profile
router.put("/users/profile", authMiddleware, async (req, res) => {
  try {
      // Validate input data using Joi
      const { error } = profileValidationSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { name, email, password } = req.body;
      const user = await User.findById(req.user.userId);

      if (!user) return res.status(404).json({ message: "User not found" });

      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = await bcrypt.hash(password, 10);

      await user.save();
      res.json({ message: "Profile updated successfully!" });
  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile." });
  }
});


router.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Route to fetch product details
router.get("/products/:productId", async (req, res) => {
  try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
  } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Server error" });
  }
});

router.post("/products", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // ✅ Validate request body
    const { error } = productValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: "Product validation failed", 
        details: error.details.map(detail => detail.message) // Extract multiple error messages
      });
    }

    // ✅ Create and save product
    const newProduct = new Product(req.body);
    await newProduct.save();

    res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/products/:productId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.productId);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.get("/cart", authMiddleware, async (req, res) => {
  try {
      if (req.user.role === "admin") {
        const cart = await Cart.find().populate('products.productId');
        return res.json(cart);
      }

      const cart = await Cart.findOne({ customerId: req.user.userId }).populate("products.productId");
      if (!cart) {
          return res.status(404).json({ message: "Cart not found" });
      }
      res.json(cart);
  } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
  }
});


router.post("/cart/add", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let cart = await Cart.findOne({ customerId: req.user.userId });

  if (!cart) {
    cart = new Cart({ customerId: req.user.userId, products: [], totalPrice: 0 });
  }

  const existingItem = cart.products.find(item => item.productId.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.products.push({ productId, quantity });
  }

  cart.totalPrice += quantity * product.price;
  await cart.save();
  res.json(cart);
});

router.delete("/cart/remove/:productId", authMiddleware, async (req, res) => {
  let cart = await Cart.findOne({ customerId: req.user.userId });

  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.products = cart.products.filter(item => item.productId.toString() !== req.params.productId);
  await cart.save();

  res.json(cart);
});

router.delete("/cart/clear", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      console.log("Unauthorized: No user ID provided");
      return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

    // Find the user's cart and remove only their items
    const cart = await Cart.findOneAndUpdate(
      { customerId: req.user.userId },
      { $set: { products: [], totalPrice: 0 } }, // Clear the cart without deleting it
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json({ message: "Cart cleared successfully", cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

router.delete("/cart/:cartId", authMiddleware, async (req, res) => {
  try {
    // Находим корзину по cartId
    let cart = await Cart.findById(req.params.cartId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Удаляем корзину
    await Cart.findByIdAndDelete(req.params.cartId);

    res.json({ message: "Cart deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart:", error);
    res.status(500).json({ message: "Failed to delete cart" });
  }
});


router.post("/orders", authMiddleware, async (req, res) => {
  const { products } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: "Order must contain products." });
  }

  let totalAmount = 0;

  // Calculate total price
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) return res.status(404).json({ message: `Product with ID ${item.productId} not found` });

    totalAmount += product.price * item.quantity;
  }

  // Remove only the ordered items from the cart
  const cart = await Cart.findOne({ customerId: req.user.userId });

  if (cart) {
    // Remove ordered items from cart
    const updatedCartProducts = cart.products.filter(item => 
      !products.some(orderItem => orderItem.productId === item.productId.toString())
    );

    // Update the cart with remaining products
    cart.products = updatedCartProducts;
    await cart.save();
  }

  res.status(200).json({ message: "Items removed from the cart." });
});


router.get("/orders", authMiddleware, async (req, res) => {
  try {
    // If the user is an admin, fetch all orders
    if (req.user.role === "admin") {
      const orders = await Order.find().populate('products.productId');
      return res.json(orders); // Return all orders to the admin
    }

    // If the user is not an admin (e.g., customer), fetch only their orders
    const orders = await Order.find({ customerId: req.user.userId }).populate('products.productId');
    res.json(orders); // Return orders for the logged-in customer
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.put("/orders/:orderId", authMiddleware, async (req, res) => {
  console.log("Updating order with ID:", req.params.orderId); // Логируем
  try {
      const order = await Order.findById(req.params.orderId);
      if (!order) {
          return res.status(404).json({ message: "Order not found" });
      }

      if (req.user.role !== "admin" && order.customerId.toString() !== req.user.userId) {
          return res.status(403).json({ message: "You are not authorized to update this order" });
      }

      order.status = req.body.status;
      await order.save();
      res.json(order);
  } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
  }
});


router.post("/payment", authMiddleware, async (req, res) => {
  const { cardNumber, cvv, products } = req.body;

  if (!cardNumber || !cvv || !products || products.length === 0) {
      return res.status(400).json({ message: "Invalid payment details." });
  }

  const customerId = req.user.userId;

  // Calculate the total amount from the cart products
  let totalAmount = 0;
  const orderProducts = [];

  for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product with ID ${item.productId} not found` });

      totalAmount += product.price * item.quantity;
      orderProducts.push({ productId: product._id, quantity: item.quantity });
  }

  // Create the order with the payment data
  const order = new Order({
      customerId: customerId,
      products: orderProducts,
      totalAmount: totalAmount,
      status: "Placed",  // Immediately set status to "Placed"
  });

  try {
      // Save the order to the database
      await order.save();

      const payment = new Payment({
          orderId: order._id,
          customerId: customerId,
          amount: totalAmount,
          paymentMethod: "Credit Card",
          status: "Successful"
      });

      await payment.save();

      res.status(200).json({ message: "Payment successful!", orderId: order._id });
  } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to process payment and create order." });
  }
});


//get for payment
router.get("/payments", authMiddleware, async (req, res) => {
  try {
      const payments = await Payment.find();
      res.json(payments);
  } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
  }
});

router.get("/customers", authMiddleware, async (req, res) => {
  try {
      const user = await User.find();  // Corrected to User model
      if (!user) {
          return res.status(404).json({ message: "Customer not found" });
      }
      res.json(user);  // Send the user details
  } catch (error) {
      res.status(500).json({ message: "Server error" });
      console.error("Error fetching customer:", error);
  }
});

router.delete("/customers/:customerId", authMiddleware, async (req, res) => {
  try {
      const customer = await User.findById(req.params.customerId);
      if (!customer) {
          return res.status(404).json({ message: "Customer not found" });
      }
      await customer.deleteOne();
      res.json({ message: "Customer deleted successfully" });
      console.log("Customer deleted successfully");
    }
    catch (error) {
      res.status(500).json({ message: "Server error" });
      console.error("Error deleting customer:", error);
    }
  });

module.exports = router;
