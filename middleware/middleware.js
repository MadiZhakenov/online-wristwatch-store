const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];  // Извлекаем токен

  if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;  // Данные пользователя прикрепляются к запросу
      next();  // Переходим к следующему middleware
  } catch (error) {
      res.status(403).json({ message: "Forbidden: Invalid token" });  // Для невалидных токенов
  }
};


// 🔹 Admin Middleware (Restrict Access to Admins Only)
exports.adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied: Admins Only" });
    }
    next();
};

// 🔹 Ensure User's Cart is Assigned Correctly (Middleware for Cart Operations)
exports.cartMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: Please log in" });
        }
        req.customerId = req.user.userId; // Attach customer ID to request
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
